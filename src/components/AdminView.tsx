import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizSet {
  quizId: string;
  title: string;
  questions: Question[];
}

const API_BASE_URL = 'http://localhost:3002/api';

export default function AdminView() {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<QuizSet[]>([]);
  const [quizSet, setQuizSet] = useState<QuizSet>({
    quizId: crypto.randomUUID(),
    title: '',
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes`);
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load quizzes',
        variant: 'destructive'
      });
    }
  };

  const saveQuiz = async () => {
    if (!quizSet.title || quizSet.questions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Quiz title and at least one question are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizSet),
      });

      if (!response.ok) throw new Error('Failed to save quiz');
      
      toast({
        title: 'Success',
        description: 'Quiz saved successfully'
      });
      
      // Reset form and refresh quiz list
      setQuizSet({
        quizId: crypto.randomUUID(),
        title: '',
        questions: []
      });
      fetchQuizzes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save quiz',
        variant: 'destructive'
      });
    }
  };

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt)) {
      setQuizSet(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }));
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

  const exportQuiz = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${quizSet.quizId}`);
      if (!response.ok) throw new Error('Failed to fetch quiz data');
      const data = await response.json();
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `quiz-${quizSet.quizId}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export quiz',
        variant: 'destructive'
      });
    }
  };

  const importQuiz = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const importedQuiz = JSON.parse(text);
        
        if (!importedQuiz.title || !Array.isArray(importedQuiz.questions)) {
          throw new Error('Invalid quiz format');
        }

        const response = await fetch(`${API_BASE_URL}/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...importedQuiz,
            quizId: importedQuiz.quizId || crypto.randomUUID()
          }),
        });

        if (!response.ok) throw new Error('Failed to import quiz');

        toast({
          title: 'Success',
          description: 'Quiz imported successfully'
        });

        fetchQuizzes();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to import quiz',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side Pane - Quiz List */}
      <div className="w-80 border-r p-4 bg-gray-50">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Saved Quizzes</h2>
          <div className="text-sm text-gray-500 mb-4">{quizzes.length} quizzes available</div>
        </div>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-2 pr-4">
            {quizzes.map((quiz) => (
              <Card 
                key={quiz.quizId} 
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-100 ${quizSet.quizId === quiz.quizId ? 'border-primary' : ''}`}
                onClick={() => setQuizSet(quiz)}
              >
                <h4 className="font-medium">{quiz.title}</h4>
                <p className="text-sm text-gray-500">{quiz.questions.length} questions</p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Side - Quiz Editor */}
      <div className="flex-1 p-4 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quiz Info */}
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Quiz ID: {quizSet.quizId}</div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={quizSet.title}
                onChange={(e) => setQuizSet(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title"
              />
            </div>

            {/* Add Question Form */}
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
              
              <Button onClick={addQuestion} className="w-full mt-2">
                Add Question
              </Button>
            </div>

            {/* Question List */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Questions ({quizSet.questions.length})</h3>
              {quizSet.questions.map((q, index) => (
                <Card key={index} className="p-4">
                  <p className="font-medium">{q.question}</p>
                  <ul className="list-disc pl-6 mt-2">
                    {q.options.map((opt, optIndex) => (
                      <li key={optIndex} className={optIndex === q.correctAnswer ? 'text-green-600 font-medium' : ''}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            {/* Save Quiz */}
            <Button onClick={saveQuiz} className="w-full" disabled={!quizSet.title || quizSet.questions.length === 0}>
              Save Quiz
            </Button>

            {/* Import/Export */}
            <div className="flex gap-4">
              <Button onClick={exportQuiz} disabled={quizSet.questions.length === 0}>
                Export Quiz
              </Button>
              <div>
                <Label htmlFor="import-quiz" className="sr-only">Import Quiz File</Label>
                <input
                  type="file"
                  accept=".json"
                  onChange={importQuiz}
                  className="hidden"
                  id="import-quiz"
                  aria-label="Import Quiz File"
                  title="Import Quiz File"
                />
                <Button
                  onClick={() => document.getElementById('import-quiz')?.click()}
                  variant="outline"
                >
                  Import Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
