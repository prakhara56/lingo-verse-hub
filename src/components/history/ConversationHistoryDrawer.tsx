
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, Trash2, Loader2 } from 'lucide-react';
import { useConversationHistory, ConversationType, ConversationHistory } from '@/hooks/use-conversation-history';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface ConversationHistoryDrawerProps {
  type: ConversationType;
  onSelectHistory: (history: ConversationHistory) => void;
  trigger?: React.ReactNode;
}

const ConversationHistoryDrawer = ({
  type,
  onSelectHistory,
  trigger
}: ConversationHistoryDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { histories, loading, fetchHistory, deleteHistory } = useConversationHistory(type);
  
  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteHistory(deleteId);
      setDeleteId(null);
    }
  };

  const handleSelectHistory = (history: ConversationHistory) => {
    onSelectHistory(history);
    setOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger || <Button variant="ghost" size="icon"><History className="h-5 w-5" /></Button>}
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Conversation History</SheetTitle>
            <SheetDescription>
              View and restore previous conversations
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : histories.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No conversation history yet
              </div>
            ) : (
              <ScrollArea className="h-[70vh]">
                <div className="space-y-2 pr-2">
                  {histories.map((history) => (
                    <div 
                      key={history.id} 
                      className="flex justify-between items-center p-3 rounded-md hover:bg-accent cursor-pointer group"
                    >
                      <div
                        className="flex-1 truncate mr-2"
                        onClick={() => handleSelectHistory(history)}
                      >
                        <div className="font-medium truncate">{history.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(history.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => setDeleteId(history.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation history?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this conversation history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConversationHistoryDrawer;
