import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { BedrockService } from '../bedrock.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule

const client = generateClient<Schema>();

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule], // Add HttpClientModule here
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent implements OnInit {
  todos: any[] = [];
  prompt: string = '';
  generatedText: string = '';
  response: string = '';

  constructor(private bedrockService: BedrockService) {}

  ngOnInit(): void {
    this.listTodos();
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
}
