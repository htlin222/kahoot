import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Trash2, ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react';

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
  const [isLeftPaneCollapsed, setIsLeftPaneCollapsed] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const validateQuizStructure = (quiz: any): quiz is QuizSet => {
    if (!quiz || typeof quiz !== 'object') return false;
    if (typeof quiz.title !== 'string' || !quiz.title) return false;
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) return false;
    
    return quiz.questions.every((q: any) => {
      if (typeof q.question !== 'string' || !q.question) return false;
      if (!Array.isArray(q.options) || q.options.length !== 4) return false;
      if (!q.options.every((opt: any) => typeof opt === 'string' && opt)) return false;
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) return false;
      return true;
    });
  };

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

  const deleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete quiz');
      
      toast({
        title: 'Success',
        description: 'Quiz deleted successfully'
      });
      
      if (quizSet.quizId === quizId) {
        setQuizSet({
          quizId: crypto.randomUUID(),
          title: '',
          questions: []
        });
      }
      
      fetchQuizzes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete quiz',
        variant: 'destructive'
      });
    }
  };

  const deleteQuestion = (index: number) => {
    setQuizSet(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
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

  const exportQuiz = async (quiz: QuizSet) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${quiz.quizId}`);
      if (!response.ok) throw new Error('Failed to fetch quiz data');
      const data = await response.json();
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `quiz-${quiz.quizId}.json`;

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
        
        if (!validateQuizStructure(importedQuiz)) {
          throw new Error('Invalid quiz structure');
        }

        // Always generate a new quizId for imported quizzes
        const newQuizId = crypto.randomUUID();
        
        const response = await fetch(`${API_BASE_URL}/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...importedQuiz,
            quizId: newQuizId // Always use new ID
          }),
        });

        if (!response.ok) throw new Error('Failed to import quiz');

        toast({
          title: 'Success',
          description: 'Quiz imported successfully with new ID'
        });

        // Clear the file input for future imports
        if (event.target) {
          event.target.value = '';
        }

        fetchQuizzes();
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to import quiz',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side Pane - Quiz List */}
      <div className={`relative ${isLeftPaneCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 ease-in-out`}>
        <div className={`absolute inset-0 border-r bg-gray-50 ${isLeftPaneCollapsed ? 'invisible' : 'visible'}`}>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Saved Quizzes</h2>
                <div className="text-sm text-gray-500">{quizzes.length} quizzes</div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Label htmlFor="import-quiz">Import Quiz File</Label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importQuiz}
                    className="hidden"
                    id="import-quiz"
                    title="Import Quiz File"
                    aria-label="Import Quiz File"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('import-quiz')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="space-y-2 pr-4">
                {quizzes.map((quiz) => (
                  <Card 
                    key={quiz.quizId} 
                    className={`p-4 ${quizSet.quizId === quiz.quizId ? 'border-primary' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setQuizSet(quiz)}
                      >
                        <h4 className="font-medium">{quiz.title}</h4>
                        <p className="text-sm text-gray-500">{quiz.questions.length} questions</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportQuiz(quiz);
                          }}
                          title="Export Quiz"
                          aria-label="Export Quiz"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuiz(quiz.quizId);
                          }}
                          title="Delete Quiz"
                          aria-label="Delete Quiz"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        {/* Collapse Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white border shadow-sm"
          onClick={() => setIsLeftPaneCollapsed(!isLeftPaneCollapsed)}
          title={isLeftPaneCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isLeftPaneCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isLeftPaneCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
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
                      onClick={() => deleteQuestion(index)}
                      title="Delete Question"
                      aria-label="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Save Quiz */}
            <Button onClick={saveQuiz} className="w-full" disabled={!quizSet.title || quizSet.questions.length === 0}>
              Save Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
