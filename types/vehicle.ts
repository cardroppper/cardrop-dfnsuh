
export type ModificationCategory =
  | 'Engine'
  | 'Intake'
  | 'Exhaust'
  | 'Suspension'
  | 'Wheels & Tyres'
  | 'Brakes'
  | 'Aero'
  | 'Electronics'
  | 'Interior';

export const MODIFICATION_CATEGORIES: ModificationCategory[] = [
  'Engine',
  'Intake',
  'Exhaust',
  'Suspension',
  'Wheels & Tyres',
  'Brakes',
  'Aero',
  'Electronics',
  'Interior',
];

export interface VehicleFormData {
  manufacturer: string;
  model: string;
  year: string;
  body_style: string;
  fuel_type: string;
  drivetrain: string;
  engine_configuration: string;
  induction_type: string;
  transmission_type: string;
  power_output: string;
  torque_output: string;
  is_public: boolean;
}

export interface ModificationFormData {
  category: ModificationCategory;
  brand_name: string;
  part_name: string;
  description: string;
}
