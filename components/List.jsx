'use client';

import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Plus, X, Calendar, CheckCircle } from 'lucide-react';

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
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-[#3B1C32] rounded-lg p-4 w-72 ${
            snapshot.isDragging ? 'shadow-2xl rotate-2' : 'shadow-lg'
          } transition-all duration-200`}
        >
          <div 
            {...provided.dragHandleProps}
            className="flex justify-between items-center mb-4"
          >
            <h3 className="font-semibold text-white">{list.title}</h3>
            <button 
              onClick={() => onDeleteList(list.id)} 
              className="text-[#A64D79] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <Droppable droppableId={list.id} type="CARD">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className={`min-h-[2px] ${
                  snapshot.isDraggingOver ? 'bg-[#6A1E55] rounded-lg p-2' : ''
                } transition-colors duration-200`}
              >
                {list.cards?.map((card, cardIndex) => (
                  <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onCardClick(card)}
                        className={`bg-[#1A1A1D] p-3 rounded-lg mb-2 border border-[#6A1E55] 
                          ${snapshot.isDragging ? 'shadow-xl rotate-3' : 'shadow hover:shadow-md'} 
                          transition-all duration-200 cursor-grab ${card.completed ? 'border-[#A64D79]' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              {card.completed && (
                                <CheckCircle size={16} className="text-[#A64D79]" />
                              )}
                              <p className={`text-white ${card.completed ? 'line-through text-[#A64D79]' : ''}`}>
                                {card.title}
                              </p>
                            </div>
                            {card.description && (
                              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                {card.description}
                              </p>
                            )}
                          </div>
                          {card.dueDate && (
                            <span className="flex items-center text-xs text-[#A64D79]">
                              <Calendar size={14} className="mr-1" />
                              {new Date(card.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
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
                className="w-full p-2 bg-[#1A1A1D] text-white border border-[#6A1E55] rounded-lg mb-2 focus:ring-2 focus:ring-[#A64D79] outline-none"
                placeholder="Enter card title..."
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="text-[#A64D79] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#6A1E55] hover:bg-[#A64D79] text-white px-3 py-1 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center mt-2 text-[#A64D79] hover:text-white transition-colors"
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