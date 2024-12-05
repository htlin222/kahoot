import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { QuizSet, Question } from '../types/quiz';
import { QuestionForm } from './QuestionForm';
import { QuestionList } from './QuestionList';

interface QuizEditorProps {
  quiz: QuizSet;
  onQuizChange: (quiz: QuizSet) => void;
  onSave: () => void;
}

export function QuizEditor({ quiz, onQuizChange, onSave }: QuizEditorProps) {
  const handleAddQuestion = (question: Question) => {
    onQuizChange({
      ...quiz,
      questions: [...quiz.questions, question]
    });
  };

  const handleDeleteQuestion = (index: number) => {
    onQuizChange({
      ...quiz,
      questions: quiz.questions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quiz Info */}
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Quiz ID: {quiz.quizId}</div>
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={quiz.title}
              onChange={(e) => onQuizChange({ ...quiz, title: e.target.value })}
              placeholder="Enter quiz title"
            />
          </div>

          {/* Add Question Form */}
          <QuestionForm onAddQuestion={handleAddQuestion} />

          {/* Question List */}
          <QuestionList 
            questions={quiz.questions} 
            onDeleteQuestion={handleDeleteQuestion}
          />

          {/* Save Quiz */}
          <Button 
            onClick={onSave} 
            className="w-full" 
            disabled={!quiz.title || quiz.questions.length === 0}
          >
            Save Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
