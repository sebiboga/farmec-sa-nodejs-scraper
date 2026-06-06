import { jest } from '@jest/globals';
import fs from 'fs';

const mockFetch = jest.fn();

jest.unstable_mockModule('node-fetch', () => ({
  default: mockFetch
}));

const COMPANY_JSON_PATH = 'tmp/company.json';

function backupCompanyJson() {
  if (fs.existsSync(COMPANY_JSON_PATH)) {
    const content = fs.readFileSync(COMPANY_JSON_PATH, 'utf-8');
    fs.renameSync(COMPANY_JSON_PATH, `${COMPANY_JSON_PATH}.bak`);
    return content;
  }
  return null;
}

function restoreCompanyJson() {
  if (fs.existsSync(`${COMPANY_JSON_PATH}.bak`)) {
    fs.renameSync(`${COMPANY_JSON_PATH}.bak`, COMPANY_JSON_PATH);
  }
  return null;
}

function anafCompanyResponse(data) {
  return {
    ok: true,
    json: async () => ({ data, success: true })
  };
}

function peviitorResponse(companies) {
  return {
    ok: true,
    json: async () => ({ companies })
  };
}

function solrResponse(numFound, docs) {
  return {
    ok: true,
    json: async () => ({ response: { numFound, docs } })
  };
}

function errorResponse(status) {
  return {
    ok: false,
    status,
    text: async () => 'Error'
  };
}

const FARMEC_ANAF_RECORD = {
  cui: 199150,
  name: 'FARMEC SA',
  address: 'Str. HENRI BARBUSSE, 16, Municipiul Cluj-Napoca, Cluj',
  caenCode: '2042',
  inactive: false,
  inactiveSince: null,
  reactivatedSince: null,
  registrationNumber: 'J1991000014122',
  vatRegistered: true,
  eFacturaRegistered: false,
  onrcStatusLabel: 'Funcțiune',
  legalForm: 'SA',
  headquartersAddress: { locality: 'Cluj-Napoca', county: 'CLUJ' }
};

describe('company.js', () => {
  let company;
  let savedCompanyJson;

  beforeAll(async () => {
    fs.mkdirSync("tmp", { recursive: true });
    process.env.SOLR_AUTH = 'test:test';
    savedCompanyJson = backupCompanyJson();
    company = await import('../../company.js');
  });

  afterAll(() => {
    delete process.env.SOLR_AUTH;
    restoreCompanyJson();
  });

  beforeEach(() => {
    mockFetch.mockReset();
    if (fs.existsSync(COMPANY_JSON_PATH)) {
      fs.unlinkSync(COMPANY_JSON_PATH);
    }
  });

  describe('getCompanyBrand', () => {
    it('should return the company brand', () => {
      const brand = company.getCompanyBrand();
      expect(typeof brand).toBe('string');
      expect(brand).toBe('FARMEC');
    });
  });

  describe('getCompanyData (no cache)', () => {
    it('should fetch company by hardcoded CIF and return company data', async () => {
      mockFetch.mockResolvedValueOnce(anafCompanyResponse(FARMEC_ANAF_RECORD));

      const result = await company.getCompanyData();

      expect(result).toHaveProperty('company', 'FARMEC SA');
      expect(result).toHaveProperty('cif', '199150');
      expect(result).toHaveProperty('active', true);
      expect(result).toHaveProperty('anafData');
      expect(result.anafData.name).toBe('FARMEC SA');
    });

    it('should throw when ANAF returns no data', async () => {
      mockFetch.mockResolvedValueOnce(anafCompanyResponse(null));

      await expect(company.getCompanyData()).rejects.toThrow('No data from ANAF');
    });

    it('should throw when ANAF returns no company name', async () => {
      mockFetch.mockResolvedValueOnce(anafCompanyResponse({ cui: 199150, name: null }));

      await expect(company.getCompanyData()).rejects.toThrow('ANAF returned no company name');
    });

    it('should return inactive flag when company is inactive', async () => {
      const inactiveRecord = { ...FARMEC_ANAF_RECORD, inactive: true };
      mockFetch.mockResolvedValueOnce(anafCompanyResponse(inactiveRecord));

      const result = await company.getCompanyData();

      expect(result.active).toBe(false);
      expect(result.anafData.inactive).toBe(true);
    });
  });

  describe('getCompanyData (with cache)', () => {
    const cachedData = {
      anaf: FARMEC_ANAF_RECORD,
      summary: {
        company: 'FARMEC SA',
        cif: '199150',
        active: true
      }
    };

    beforeEach(() => {
      fs.writeFileSync(COMPANY_JSON_PATH, JSON.stringify(cachedData), 'utf-8');
    });

    it('should use cached company data when available', async () => {
      const result = await company.getCompanyData();

      expect(result.company).toBe('FARMEC SA');
      expect(result.cif).toBe('199150');
      expect(result.active).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('validateAndGetCompany', () => {
    it('should return company data with status active', async () => {
      mockFetch
        .mockResolvedValueOnce(anafCompanyResponse(FARMEC_ANAF_RECORD))
        .mockResolvedValueOnce(solrResponse(3, [
          { url: 'https://www.farmec.ro/compania/joburi/job-1/', title: 'Job 1' },
          { url: 'https://www.farmec.ro/compania/joburi/job-2/', title: 'Job 2' }
        ]))
        .mockResolvedValueOnce(peviitorResponse([{ company: 'FARMEC SA' }]));

      const result = await company.validateAndGetCompany();

      expect(result).toHaveProperty('status', 'active');
      expect(result).toHaveProperty('company', 'FARMEC SA');
      expect(result).toHaveProperty('cif', '199150');
      expect(result).toHaveProperty('existingJobsCount');
      expect(typeof result.existingJobsCount).toBe('number');
    });

    it('should return inactive status when company is inactive', async () => {
      const inactiveRecord = { ...FARMEC_ANAF_RECORD, inactive: true };

      mockFetch
        .mockResolvedValueOnce(anafCompanyResponse(inactiveRecord))
        .mockResolvedValueOnce(solrResponse(0, []));

      const result = await company.validateAndGetCompany();

      expect(result).toHaveProperty('status', 'inactive');
    });

    it('should throw when ANAF returns no data', async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(500));

      await expect(company.validateAndGetCompany()).rejects.toThrow();
    });
  });
});
