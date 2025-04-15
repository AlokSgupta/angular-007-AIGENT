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
    const flowchartData = {
      nodes: [
        { id: 'A', label: 'Title Page' },
        { id: 'B', label: 'Executive Summary' },
        { id: 'C', label: 'Table of Contents', shape: 'diamond' },
        { id: 'D', label: 'Introduction' },
        { id: 'E', label: 'Materials and Methods' },
        { id: 'F', label: 'Conclusions' },
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
    this.bedrockService.generateText(this.prompt)
      .subscribe({
        next: (text: any) => {
          this.generatedText = JSON.stringify(text.body,null,2); // Update the generatedText property with the API response
          console.log('Generated text:', this.generatedText);
        },
        error: (error) => {
          console.error('Error generating text:', error);
          this.generatedText = 'An error occurred while generating the response.'; // Handle errors
        }
      });
      this.renderMermaid(flowchartData);
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
