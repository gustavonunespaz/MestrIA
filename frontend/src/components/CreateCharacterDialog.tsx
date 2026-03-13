import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface CreateCharacterDialogProps {
  campaignId: string;
}

export function CreateCharacterDialog({ campaignId }: CreateCharacterDialogProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={() => navigate(`/campaign/${campaignId}/character/create`)}
    >
      <UserPlus className="h-4 w-4" />
      Novo Personagem
    </Button>
  );
}
