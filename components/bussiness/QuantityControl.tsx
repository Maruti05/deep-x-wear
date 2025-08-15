import { Button } from "../ui/button";

interface QuantityControlProps {
  quantity: number;
  availableQuantity?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  availableQuantity,
  onIncrease,
  onDecrease,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button size="icon" variant="outline" onClick={onDecrease}>
        -
      </Button>
      <span className="w-6 text-center text-sm font-medium">{quantity}</span>
      <Button
        size="icon"
        variant="outline"
        onClick={onIncrease}
        disabled={availableQuantity !== undefined && quantity >= availableQuantity}
      >
        +
      </Button>
    </div>
  );
};
