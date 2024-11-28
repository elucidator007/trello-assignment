'use client';

import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Plus, X } from 'lucide-react';

export const List = ({ list, index, onAddCard, onDeleteList, onCardClick }) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(list.id, newCardTitle);
      setNewCardTitle('');
      setIsAdding(false);
    }
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-white rounded p-4 w-72"
        >
          <div 
            {...provided.dragHandleProps}
            className="flex justify-between items-center mb-4"
          >
            <h3 className="font-semibold">{list.title}</h3>
            <button onClick={() => onDeleteList(list.id)} className="text-gray-500">
              <X size={20} />
            </button>
          </div>

          <Droppable droppableId={list.id}>
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className="min-h-[2px]"
              >
                {list.cards?.map((card, cardIndex) => (
                  <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onCardClick(card)}
                        className="bg-white p-3 rounded mb-2 shadow-sm cursor-pointer border border-gray-200"
                      >
                        {card.title}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {isAdding ? (
            <form onSubmit={handleAddCard}>
              <input
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Enter card title..."
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center mt-2 text-gray-500"
            >
              <Plus size={20} className="mr-1" />
              Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
};
