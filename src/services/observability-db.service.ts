import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { Observable } from 'rxjs';

@Injectable()
export class ObservabilityDbService {
    constructor(private readonly databaseService: DatabaseService) {}

    trackProductChange(productId: string, changeDetails: any): Observable<void> {
        // Logic to track product changes in the database
        return this.databaseService.insertEvent({ productId, changeDetails });
    }

    monitorProductEvent(productId: string): Observable<any> {
        // Logic to monitor product events
        return this.databaseService.getProductMonitoring(productId);
    }
}