import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { BedrockService } from '../bedrock.service';

const client = generateClient<Schema>();

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Add HttpClientModule here
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent implements OnInit {
  todos: any[] = [];
  prompt: string = 'who is Alok?';
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
      .subscribe(text => {
        this.generatedText = text;
        console.log('Generated text:', text);
        this.response = text;
      });
  }
}
