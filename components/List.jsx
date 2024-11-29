import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from 'lucide-react';
import { Card } from './Card';
import { colors } from '@/lib/constants';

export const List = ({ list, index, onDeleteList, onAddCard, onCardClick, onUpdateTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onUpdateTitle(list.id, editTitle);
    }
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: colors.secondary
          }}
          className="rounded-lg p-4 w-72 flex-shrink-0 shadow-lg"
        >
          <div 
            className="flex justify-between items-center mb-4"
            {...provided.dragHandleProps}
          >
            <div className="flex-1 font-bold text-gray-700">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <Input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSubmit}
                    className="py-0 px-1 h-7"
                  />
                </form>
              ) : (
                <span 
                  className="cursor-pointer hover:bg-gray-200 px-1 rounded"
                  onClick={() => {
                    setIsEditing(true);
                    setEditTitle(list.title);
                  }}
                >
                  {list.title}
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDeleteList(list.id)}
              className="hover:bg-red-100"
            >
              <X className="h-4 w-4 text-gray-600" />
            </Button>
          </div>

          <Droppable droppableId={list.id} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2 min-h-[50px] rounded-md p-2"
                style={{ 
                  backgroundColor: snapshot.isDraggingOver 
                    ? colors.background
                    : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {list.cards.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={index}
                    onCardClick={onCardClick}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <Button 
            variant="ghost" 
            className="w-full mt-4 text-gray-600 hover:text-gray-800"
            style={{ backgroundColor: colors.surface }}
            onClick={() => onAddCard(list.id)}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Card
          </Button>
        </div>
      )}
    </Draggable>
  );
};