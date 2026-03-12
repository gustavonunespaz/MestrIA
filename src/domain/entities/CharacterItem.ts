export interface CharacterItemProps {
  id: string;
  characterId: string;
  itemId: string;
}

export class CharacterItem {
  private props: CharacterItemProps;

  constructor(props: CharacterItemProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get characterId(): string {
    return this.props.characterId;
  }

  get itemId(): string {
    return this.props.itemId;
  }
}
