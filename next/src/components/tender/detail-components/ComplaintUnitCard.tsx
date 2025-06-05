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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center">
        <div className="mr-3 rounded-full bg-blue-50 p-2">
          <Building className="h-5 w-5 text-blue-600" />
        </div>
        <h4 className="font-medium text-gray-800">{unit.name}</h4>
      </div>

      {unit.phone && (
        <div className="my-2 flex items-center text-gray-600">
          <Phone className="mr-2 h-4 w-4 text-gray-400" />
          <a
            href={`tel:${unit.phone.replace(/[^\d]/g, '')}`}
            className="text-sm hover:text-blue-600"
          >
            {unit.phone}
          </a>
        </div>
      )}

      {unit.fax && (
        <div className="my-2 flex items-center text-gray-600">
          <Printer className="mr-2 h-4 w-4 text-gray-400" />
          <span className="text-sm">{unit.fax}</span>
        </div>
      )}

      {unit.address && (
        <div className="my-2 flex items-start text-gray-600">
          <MapPin className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="text-sm">{unit.address}</span>
        </div>
      )}
    </div>
  );
}
