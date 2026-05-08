import { Injectable, Logger } from '@nestjs/common';

export interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
  date: string;
}

export interface CbarRatesResponse {
  date: string;
  rates: CurrencyRate[];
}

@Injectable()
export class CbarService {
  private cache: Map<string, CbarRatesResponse> = new Map();
  private readonly logger = new Logger(CbarService.name);

  async getRates(date?: string): Promise<CbarRatesResponse> {
    const targetDate = date || this.formatDate(new Date());
    const cached = this.cache.get(targetDate);
    if (cached) return cached;

    try {
      const url = `https://www.cbar.az/currencies/${targetDate}.xml`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CBAR returned ${res.status}`);

      const xml = await res.text();
      const rates = this.parseXml(xml, targetDate);

      this.cache.set(targetDate, rates);

      if (this.cache.size > 30) {
        const oldest = this.cache.keys().next().value;
        if (oldest) this.cache.delete(oldest);
      }

      return rates;
    } catch (error) {
      this.logger.error(`Failed to fetch CBAR rates for ${targetDate}: ${error.message}`);
      return { date: targetDate, rates: [] };
    }
  }

  private parseXml(xml: string, date: string): CbarRatesResponse {
    const rates: CurrencyRate[] = [];
    const regex = /<Valute Code="([^"]+)">\s*<Nominal>[^<]+<\/Nominal>\s*<Name>([^<]+)<\/Name>\s*<Value>([^<]+)<\/Value>\s*<\/Valute>/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(xml)) !== null) {
      rates.push({
        code: match[1],
        name: match[2].trim(),
        rate: parseFloat(match[3]),
        date,
      });
    }
    return { date, rates };
  }

  private formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }
}
