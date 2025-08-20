import { IndexedDB } from "../utils/db";

interface PageVisit {
  url: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: number;
}

export class SitemapCollector {
  private static async saveVisit(path: string) {
    const store = await IndexedDB.getStore("readwrite");
    const visit: PageVisit = {
      url: path,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.8,
    };

    return new Promise<void>((resolve, reject) => {
      const request = store.put(visit);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async recordCompanyVisit(taxId: string) {
    await this.saveVisit(`/company/detail/${taxId}`);
  }

  static async recordTenderVisit(tenderId: string) {
    await this.saveVisit(`/tender/detail/${tenderId}`);
  }

  static async recordToolVisit(toolId: string) {
    await this.saveVisit(`/aitool/detail/${toolId}`);
  }

  static async getAllVisitedUrls(): Promise<PageVisit[]> {
    const store = await IndexedDB.getStore();
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  static async cleanOldRecords(days: number = 30) {
    const store = await IndexedDB.getStore("readwrite");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return new Promise<void>((resolve, reject) => {
      const request = store.openCursor();
      request.onerror = () => reject(request.error);
      request.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const visit = cursor.value as PageVisit;
          if (new Date(visit.lastmod) < cutoff) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}
