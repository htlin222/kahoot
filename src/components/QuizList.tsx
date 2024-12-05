import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { QuizSet } from '../types/quiz';
import { Trash2, ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { quizService } from '../services/quizService';

interface QuizListProps {
  quizzes: QuizSet[];
  selectedQuizId: string;
  isCollapsed: boolean;
  onQuizSelect: (quiz: QuizSet) => void;
  onQuizDelete: (quizId: string) => void;
  onToggleCollapse: () => void;
  onQuizzesUpdate: () => void;
}

export function QuizList({
  quizzes,
  selectedQuizId,
  isCollapsed,
  onQuizSelect,
  onQuizDelete,
  onToggleCollapse,
  onQuizzesUpdate
}: QuizListProps) {
  const { toast } = useToast();

  const handleExport = async (quiz: QuizSet, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await quizService.exportQuiz(quiz.quizId);
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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const importedQuiz = JSON.parse(text);
        
        if (!quizService.validateQuizStructure(importedQuiz)) {
          throw new Error('Invalid quiz structure');
        }

        // Always generate a new quizId for imported quizzes
        const newQuizId = crypto.randomUUID();
        
        await quizService.saveQuiz({
          ...importedQuiz,
          quizId: newQuizId
        });

        toast({
          title: 'Success',
          description: 'Quiz imported successfully with new ID'
        });

        // Clear the file input for future imports
        if (event.target) {
          event.target.value = '';
        }

        onQuizzesUpdate();
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
    <div className={`relative ${isCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 ease-in-out`}>
      <div className={`absolute inset-0 border-r bg-gray-50 ${isCollapsed ? 'invisible' : 'visible'}`}>
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
                  onChange={handleImport}
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
                  className={`p-4 ${selectedQuizId === quiz.quizId ? 'border-primary' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onQuizSelect(quiz)}
                    >
                      <h4 className="font-medium">{quiz.title}</h4>
                      <p className="text-sm text-gray-500">{quiz.questions.length} questions</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        onClick={(e) => handleExport(quiz, e)}
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
                          onQuizDelete(quiz.quizId);
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
        onClick={onToggleCollapse}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
