import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BedrockService {
  constructor(private http: HttpClient) {}

  generateText(prompt: string) {
    let agentid =  "HHH33W9BJO";
    let aliasid = "8PXXBYHNIQ";
    let params = new HttpParams()
      .set("agent_id", agentid)
      .set("alias_id", aliasid)
      .set("session_id", "1234")
      .set("prompt", prompt);


      return this.http.post<string>('https://ntypzyxmz5.execute-api.us-west-2.amazonaws.com/dev/invoke-agent', { params: params });

    //return this.http.post<string>('https://ntypzyxmz5.execute-api.us-west-2.amazonaws.com/dev/alok-test-007', { prompt });
  }
}
