declare module 'tcm-types' {
  export interface Constitution {
    id: string;
    name: string;
    description: string;
    recommendations: string[];
    threshold: number;
  }

  export interface ConstitutionScore {
    id: string;
    score: number;
    threshold: number;
  }

  export interface Question {
    id: string;
    text: string;
    constitutions: Record<string, number>;
  }
}
