import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BedrockService {
  constructor(private http: HttpClient) {}

  generateText(prompt: string) {
    return this.http.post<string>('https://ntypzyxmz5.execute-api.us-west-2.amazonaws.com/dev/alok-test-007', { prompt });
  }
}
