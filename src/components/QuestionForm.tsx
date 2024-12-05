import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Question } from '../types/quiz';
import { useToast } from './ui/use-toast';

interface QuestionFormProps {
  onAddQuestion: (question: Question) => void;
}

export function QuestionForm({ onAddQuestion }: QuestionFormProps) {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt)) {
      onAddQuestion({ ...currentQuestion });
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      });
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all question fields',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <Label>New Question</Label>
      <Textarea
        value={currentQuestion.question}
        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
        placeholder="Enter question"
        className="mb-2"
      />
      
      {currentQuestion.options.map((option, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            value={option}
            onChange={(e) => {
              const newOptions = [...currentQuestion.options];
              newOptions[index] = e.target.value;
              setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
            }}
            placeholder={`Option ${index + 1}`}
          />
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
            className={currentQuestion.correctAnswer === index ? 'bg-green-100' : ''}
          >
            Correct
          </Button>
        </div>
      ))}
      
      <Button onClick={handleAddQuestion} className="w-full mt-2">
        Add Question
      </Button>
    </div>
  );
}
