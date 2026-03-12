export interface CharacterSpellProps {
  id: string;
  characterId: string;
  spellId: string;
}

export class CharacterSpell {
  private props: CharacterSpellProps;

  constructor(props: CharacterSpellProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get characterId(): string {
    return this.props.characterId;
  }

  get spellId(): string {
    return this.props.spellId;
  }
}
