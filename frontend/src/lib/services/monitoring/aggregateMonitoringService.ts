/**
 * Aggregate Monitoring Service
 * Combines monitoring data from all microservices (MyUnila, Keuangan, Feeder, Sister)
 */

import { myunilaMonitoringService, type SyncProgress as MyUnilaSyncProgress, type MonitoringStats as MyUnilaStats, type MonitoringResponse as MyUnilaResponse } from '../myunila/management/monitoringService';
import { keuanganMonitoringService } from '../keuangan/management/monitoringService';
import { feederMonitoringService } from '../feeder/management/monitoringService';
import { sisterMonitoringService } from '../sister/management/monitoringService';

export interface SyncProgress {
  id: string;
  endpoint_name: string;
  endpoint_key: string;
  sync_type: string;
  status: string;
  progress: number;
  current_record: number;
  total_records: number;
  started_at: string;
  updated_at: string;
  message: string;
  synced_by: string;
  error?: string;
  service: string; // Added: to identify which service the sync belongs to
}

export interface MonitoringStats {
  active_syncs: number;
  completed_today: number;
  failed_today: number;
  total_duration_ms: number;
  last_sync_at: string;
}

export interface AggregateMonitoringResponse {
  active_syncs: SyncProgress[];
  stats: MonitoringStats;
  updated_at: string;
  services_status: {
    myunila: boolean;
    keuangan: boolean;
    feeder: boolean;
    sister: boolean;
  };
}

class AggregateMonitoringService {
  /**
   * Get all active sync operations from all services
   */
  async getActiveSyncs(): Promise<AggregateMonitoringResponse> {
    const servicesStatus = {
      myunila: false,
      keuangan: false,
      feeder: false,
      sister: false,
    };

    // Fetch from all services in parallel
    const results = await Promise.allSettled([
      this.fetchFromService('myunila', myunilaMonitoringService),
      this.fetchFromService('keuangan', keuanganMonitoringService),
      this.fetchFromService('feeder', feederMonitoringService),
      this.fetchFromService('sister', sisterMonitoringService),
    ]);

    // Combine all active syncs
    const allSyncs: SyncProgress[] = [];
    let totalActiveSyncs = 0;
    let totalCompletedToday = 0;
    let totalFailedToday = 0;
    let totalDuration = 0;
    let latestSyncAt = new Date(0);

    results.forEach((result, index) => {
      const serviceName = ['myunila', 'keuangan', 'feeder', 'sister'][index] as keyof typeof servicesStatus;

      if (result.status === 'fulfilled' && result.value) {
        servicesStatus[serviceName] = true;
        const data = result.value;

        // Add service identifier to each sync
        const syncsWithService = data.active_syncs.map((sync: any) => ({
          ...sync,
          service: serviceName,
        }));

        allSyncs.push(...syncsWithService);

        // Aggregate stats
        totalActiveSyncs += data.stats.active_syncs;
        totalCompletedToday += data.stats.completed_today;
        totalFailedToday += data.stats.failed_today;
        totalDuration += data.stats.total_duration_ms || 0;

        // Find latest sync time
        if (data.stats.last_sync_at && data.stats.last_sync_at !== '0001-01-01T00:00:00Z') {
          const syncDate = new Date(data.stats.last_sync_at);
          if (syncDate > latestSyncAt) {
            latestSyncAt = syncDate;
          }
        }
      }
    });

    // Sort by started_at (newest first)
    allSyncs.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

    return {
      active_syncs: allSyncs,
      stats: {
        active_syncs: totalActiveSyncs,
        completed_today: totalCompletedToday,
        failed_today: totalFailedToday,
        total_duration_ms: totalDuration,
        last_sync_at: latestSyncAt.getTime() > 0 ? latestSyncAt.toISOString() : '0001-01-01T00:00:00Z',
      },
      updated_at: new Date().toISOString(),
      services_status: servicesStatus,
    };
  }

  /**
   * Fetch monitoring data from a specific service with error handling
   */
  private async fetchFromService(
    serviceName: string,
    service: any
  ): Promise<any | null> {
    try {
      return await service.getActiveSyncs();
    } catch (error) {
      console.warn(`[Monitoring] Failed to fetch from ${serviceName} service:`, error);
      return null;
    }
  }

  /**
   * Get specific sync by ID from all services
   */
  async getSyncById(id: string, serviceHint?: string): Promise<SyncProgress | null> {
    const services = [
      { name: 'myunila', service: myunilaMonitoringService },
      { name: 'keuangan', service: keuanganMonitoringService },
      { name: 'feeder', service: feederMonitoringService },
      { name: 'sister', service: sisterMonitoringService },
    ];

    // If service hint provided, try that first
    if (serviceHint) {
      const hintedService = services.find(s => s.name === serviceHint);
      if (hintedService) {
        try {
          const sync = await hintedService.service.getSyncById(id);
          return { ...sync, service: hintedService.name };
        } catch {
          // Continue to try other services
        }
      }
    }

    // Try all services
    for (const { name, service } of services) {
      try {
        const sync = await service.getSyncById(id);
        return { ...sync, service: name };
      } catch {
        // Continue to next service
      }
    }

    return null;
  }
}

export const aggregateMonitoringService = new AggregateMonitoringService();
