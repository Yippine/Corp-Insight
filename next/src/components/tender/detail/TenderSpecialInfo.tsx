'use client';

import { Section, FieldValue } from '../../../hooks/useTenderDetail';
import CommitteeCard from '../detail-components/CommitteeCard';
import ComplaintUnitCard from '../detail-components/ComplaintUnitCard';

interface TenderSpecialInfoProps {
  section: Section;
}

export default function TenderSpecialInfo({ section }: TenderSpecialInfoProps) {
  // 處理評選委員資料
  const findCommitteeMembers = (): any[] => {
    const committeeField = section.fields.find(f => f.label === '評選委員');
    if (!committeeField || !committeeField.children) return [];

    return committeeField.children.map(child => {
      const name = child.children?.find(f => f.label === '姓名')?.value || '';
      const expertise =
        child.children?.find(f => f.label === '專家學者')?.value === '是';
      const field = child.children?.find(f => f.label === '職業')?.value || '';
      const experience =
        child.children?.find(f => f.label === '專家學者專長')?.value || '';

      return { name, expertise, field, experience };
    });
  };

  // 處理檢舉受理單位資料
  const findComplaintUnits = (): any[] => {
    const complaintField = section.fields.find(f => f.label === '檢舉受理單位');
    if (!complaintField || !complaintField.children) return [];

    return complaintField.children.map(child => {
      const name = child.children?.find(f => f.label === '名稱')?.value || '';
      const phone = child.children?.find(f => f.label === '電話')?.value || '';
      const address =
        child.children?.find(f => f.label === '地址')?.value || '';
      const fax = child.children?.find(f => f.label === '傳真')?.value || '';

      return { name, phone, address, fax };
    });
  };

  // 通用欄位渲染
  const renderGeneralFields = () => {
    const generalFields = section.fields.filter(
      f => f.label !== '評選委員' && f.label !== '檢舉受理單位'
    );

    return (
      <div className="space-y-4">
        {generalFields.map(field => {
          if (!field.value && (!field.children || field.children.length === 0))
            return null;

          return (
            <div key={field.label} className="border-b border-gray-200 pb-4">
              <h3 className="mb-2 text-lg font-medium text-gray-800">
                {field.label}
              </h3>

              {field.value && (
                <div className="text-gray-600">{field.value}</div>
              )}

              {field.children && field.children.length > 0 && (
                <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {field.children.map(child => renderChildField(child))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 子欄位渲染
  const renderChildField = (field: FieldValue) => {
    if (!field.value && (!field.children || field.children.length === 0))
      return null;

    return (
      <div key={field.label} className="border-b border-gray-100 pb-2">
        <div className="text-sm font-medium text-gray-700">{field.label}</div>
        {field.value && <div className="text-gray-600">{field.value}</div>}

        {field.children && field.children.length > 0 && (
          <div className="ml-4 mt-1">
            {field.children.map(child => renderChildField(child))}
          </div>
        )}
      </div>
    );
  };

  const committeeMembers = findCommitteeMembers();
  const complaintUnits = findComplaintUnits();

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      {/* 評選委員 */}
      {committeeMembers.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-medium text-gray-800">評選委員</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {committeeMembers.map((member, index) => (
              <CommitteeCard key={index} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* 檢舉受理單位 */}
      {complaintUnits.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-medium text-gray-800">
            檢舉受理單位
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {complaintUnits.map((unit, index) => (
              <ComplaintUnitCard key={index} unit={unit} />
            ))}
          </div>
        </div>
      )}

      {/* 一般資訊 */}
      {renderGeneralFields()}
    </div>
  );
}
