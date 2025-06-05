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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center">
        <div
          className={`mr-3 rounded-full p-2 ${member.expertise ? 'bg-green-100' : 'bg-blue-100'}`}
        >
          <UserRound
            className={`h-5 w-5 ${member.expertise ? 'text-green-600' : 'text-blue-600'}`}
          />
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{member.name}</h4>
          <span
            className={`rounded px-2 py-0.5 text-xs ${member.expertise ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
          >
            {member.expertise ? '專家學者' : '一般委員'}
          </span>
        </div>
      </div>

      {member.field && (
        <div className="my-2 flex items-center text-gray-600">
          <Briefcase className="mr-2 h-4 w-4 text-gray-400" />
          <span className="text-sm">{member.field}</span>
        </div>
      )}

      {member.expertise && member.experience && (
        <div className="my-2 flex items-start text-gray-600">
          <GraduationCap className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="text-sm">{member.experience}</span>
        </div>
      )}
    </div>
  );
}
