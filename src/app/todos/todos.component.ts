import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { BedrockService } from '../bedrock.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import mermaid from 'mermaid';

const client = generateClient<Schema>();

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule], // Add HttpClientModule here
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent implements OnInit, AfterViewInit {

  @ViewChild('mermaidContainer') mermaidContainer!: ElementRef; // Add the non-null assertion operator (!)

  todos: any[] = [];
  prompt: string = '';
  generatedText: string = '';
  response: string = '';

  constructor(private bedrockService: BedrockService) {}

  ngOnInit(): void {
    this.listTodos();
  }

  ngAfterViewInit(): void {
    const flowchartData = {
      nodes: [
        { id: 'A', label: '1. Title Page - Study title - Report number - Study dates - Sponsor information - Testing facility information - Signatures of key personnel' },
        { id: 'B', label: '2. Executive Summary - Brief overview of study objectives - Key findings - Compliance statements - Important deviations (if any) ' },
        { id: 'C', label: '3. Table of Contents ', shape: 'diamond' },
        { id: 'D', label: '4. Introduction - Study purpose - Background information - Study objectives - Regulatory requirements ' },
        { id: 'E', label: '5. Materials and Methods - Test system description - Sample handling procedures - Analytical method details - Equipment and reagents used - Reference standards - Quality control samples - Validation parameters ' },
        { id: 'F', label: '6.  Conclusions - Summary of findings - Method performance - Recommendations ' },
      ],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D', label: 'Yes' },
        { from: 'C', to: 'E', label: 'No' },
        { from: 'D', to: 'E' },
        { from: 'E', to: 'F' },
      ],
    };
    this.renderMermaid(flowchartData);
  }

  listTodos() {
    try {
      this.generate();
      client.models.Todo.observeQuery().subscribe({
        next: ({ items, isSynced }) => {
          this.todos = items;
        },
      });
    } catch (error) {
      console.error('error fetching todos', error);
    }
  }

  createTodo() {
    try {
      client.models.Todo.create({
        content: window.prompt('Todo content'),
      });
      this.listTodos();
    } catch (error) {
      console.error('error creating todos', error);
    }
  }

  deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  generate() {
    this.bedrockService.generateText(this.prompt)
      .subscribe({
        next: (text: any) => {
          this.generatedText = text.body; // Update the generatedText property with the API response
          console.log('Generated text:', this.generatedText);
        },
        error: (error) => {
          console.error('Error generating text:', error);
          this.generatedText = 'An error occurred while generating the response.'; // Handle errors
        }
      });
  }


  renderMermaid(data: { nodes: { id: string; label: string; shape?: string }[]; edges: { from: string; to: string; to2?: string; label?: string }[] }): void {
    let mermaidString = 'graph LR\n';

    data.nodes.forEach((node: { id: string; label: string; shape?: string }) => {
      if (node.shape === 'diamond') {
        mermaidString += `${node.id}(${node.label})\n`;
      } else {
        mermaidString += `${node.id}[${node.label}]\n`;
      }
    });

    data.edges.forEach((edge: { from: string; to: string; to2?: string; label?: string }) => {
      if (edge.to2) {
        mermaidString += `${edge.from} --> ${edge.to}; \n`;
        mermaidString += `${edge.to} --> ${edge.to2}; \n`;
      } else if (edge.label) {
        mermaidString += `${edge.from} --"${edge.label}"--> ${edge.to}\n`;
      } else {
        mermaidString += `${edge.from} --> ${edge.to}\n`;
      }
    });

    this.mermaidContainer.nativeElement.innerHTML = mermaidString;
    mermaid.init({}, this.mermaidContainer.nativeElement);
  }
}
