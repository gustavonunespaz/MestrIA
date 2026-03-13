export interface CombatEncounterProps {
  id: string;
  isActive: boolean;
  round: number;
  turnOrder: Record<string, any>;
  campaignId: string;
}

export class CombatEncounter {
  private props: CombatEncounterProps;

  constructor(props: CombatEncounterProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get round(): number {
    return this.props.round;
  }

  get turnOrder(): Record<string, any> {
    return this.props.turnOrder;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }
}
