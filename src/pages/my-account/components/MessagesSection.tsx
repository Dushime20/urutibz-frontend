import React from 'react';
//
import { useAuth } from '../../../contexts/AuthContext';
import HandoverReturnAccountSection from './HandoverReturnAccountSection';

interface MessagesSectionProps {}

const MessagesSection: React.FC<MessagesSectionProps> = () => {
  const { user } = useAuth();

  return (
    <>
    
    <div className="mt-6">
      <HandoverReturnAccountSection userId={user?.id} />
    </div>
    </>
  );
};

export default MessagesSection;
