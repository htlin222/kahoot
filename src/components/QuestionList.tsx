import { Button } from './ui/button';
import { Card } from './ui/card';
import { Question } from '../types/quiz';
import { Trash2 } from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onDeleteQuestion: (index: number) => void;
}

export function QuestionList({ questions, onDeleteQuestion }: QuestionListProps) {
  // Sort questions by index to ensure proper order
  const sortedQuestions = [...questions].sort((a, b) => a.index - b.index);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
      {sortedQuestions.map((q, arrayIndex) => (
        <Card key={q.index} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500">Question #{q.index + 1}</span>
              </div>
              <p className="font-medium">{q.question}</p>
              <ul className="list-disc pl-6 mt-2">
                {q.options.map((opt, optIndex) => (
                  <li key={optIndex} className={optIndex === q.correctAnswer ? 'text-green-600 font-medium' : ''}>
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={() => onDeleteQuestion(arrayIndex)}
              title="Delete Question"
              aria-label="Delete Question"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
