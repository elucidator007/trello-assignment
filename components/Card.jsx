import { Draggable } from '@hello-pangea/dnd';
import { colors } from '@/lib/constants';

export const Card = ({ card, index, onCardClick }) => (
  <Draggable draggableId={card.id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          ...provided.draggableProps.style,
          backgroundColor: colors.surface,
        }}
        className={`p-3 rounded-md shadow cursor-pointer
          ${snapshot.isDragging ? 'shadow-lg' : 'shadow'}
          transition-shadow duration-200`}
        onClick={() => onCardClick(card)}
      >
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{card.title}</span>
          {card.dueDate && (
            <span className="text-xs text-gray-500">
              Due: {card.dueDate}
            </span>
          )}
        </div>
      </div>
    )}
  </Draggable>
);