'use client';

import { Building, Phone, MapPin, Printer } from 'lucide-react';

interface ComplaintUnit {
  name: string;
  phone: string;
  address: string;
  fax: string;
}

interface ComplaintUnitCardProps {
  unit: ComplaintUnit;
}

export default function ComplaintUnitCard({ unit }: ComplaintUnitCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3">
        <div className="p-2 rounded-full mr-3 bg-blue-50">
          <Building className="h-5 w-5 text-blue-600" />
        </div>
        <h4 className="text-gray-800 font-medium">{unit.name}</h4>
      </div>

      {unit.phone && (
        <div className="flex items-center my-2 text-gray-600">
          <Phone className="h-4 w-4 mr-2 text-gray-400" />
          <a 
            href={`tel:${unit.phone.replace(/[^\d]/g, '')}`} 
            className="text-sm hover:text-blue-600"
          >
            {unit.phone}
          </a>
        </div>
      )}
      
      {unit.fax && (
        <div className="flex items-center my-2 text-gray-600">
          <Printer className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm">{unit.fax}</span>
        </div>
      )}
      
      {unit.address && (
        <div className="flex items-start my-2 text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-1 flex-shrink-0" />
          <span className="text-sm">{unit.address}</span>
        </div>
      )}
    </div>
  );
}