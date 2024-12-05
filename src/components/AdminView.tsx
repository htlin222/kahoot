import { useState, useEffect } from 'react';
import { useToast } from './ui/use-toast';
import { QuizSet } from '../types/quiz';
import { quizService } from '../services/quizService';
import { QuizList } from './QuizList';
import { QuizEditor } from './QuizEditor';

export default function AdminView() {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<QuizSet[]>([]);
  const [quizSet, setQuizSet] = useState<QuizSet>({
    quizId: crypto.randomUUID(),
    title: '',
    questions: []
  });
  const [isLeftPaneCollapsed, setIsLeftPaneCollapsed] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await quizService.fetchQuizzes();
      setQuizzes(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load quizzes',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await quizService.deleteQuiz(quizId);
      
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

  const handleSaveQuiz = async () => {
    if (!quizSet.title || quizSet.questions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Quiz title and at least one question are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      await quizService.saveQuiz(quizSet);
      
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

  return (
    <div className="flex h-screen">
      <QuizList
        quizzes={quizzes}
        selectedQuizId={quizSet.quizId}
        isCollapsed={isLeftPaneCollapsed}
        onQuizSelect={setQuizSet}
        onQuizDelete={handleDeleteQuiz}
        onToggleCollapse={() => setIsLeftPaneCollapsed(!isLeftPaneCollapsed)}
        onQuizzesUpdate={fetchQuizzes}
      />
      <QuizEditor
        quiz={quizSet}
        onQuizChange={setQuizSet}
        onSave={handleSaveQuiz}
      />
    </div>
  );
}
