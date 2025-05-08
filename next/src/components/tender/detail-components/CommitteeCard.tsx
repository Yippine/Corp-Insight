'use client';

import { UserRound, Briefcase, GraduationCap } from 'lucide-react';

interface CommitteeMember {
  name: string;
  expertise: boolean;
  field: string;
  experience: string;
}

interface CommitteeCardProps {
  member: CommitteeMember;
}

export default function CommitteeCard({ member }: CommitteeCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-full mr-3 ${member.expertise ? 'bg-green-100' : 'bg-blue-100'}`}>
          <UserRound className={`h-5 w-5 ${member.expertise ? 'text-green-600' : 'text-blue-600'}`} />
        </div>
        <div>
          <h4 className="text-gray-800 font-medium">{member.name}</h4>
          <span className={`text-xs px-2 py-0.5 rounded ${member.expertise ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {member.expertise ? '專家學者' : '一般委員'}
          </span>
        </div>
      </div>

      {member.field && (
        <div className="flex items-center my-2 text-gray-600">
          <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm">{member.field}</span>
        </div>
      )}
      
      {member.expertise && member.experience && (
        <div className="flex items-start my-2 text-gray-600">
          <GraduationCap className="h-4 w-4 mr-2 text-gray-400 mt-1 flex-shrink-0" />
          <span className="text-sm">{member.experience}</span>
        </div>
      )}
    </div>
  );
}