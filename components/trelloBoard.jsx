'use client'
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const colors = {
  primary: '#89A8B2',
  secondary: '#B3C8CF',
  background: '#E5E1DA',
  surface: '#F1F0E8',
};

const TrelloBoard = () => {
  const [mounted, setMounted] = useState(false);
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('trelloLists');
    if (savedData) {
      setLists(JSON.parse(savedData));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('trelloLists', JSON.stringify(lists));
    }
  }, [lists, mounted]);

  const reorderLists = (startIndex, endIndex) => {
    const result = Array.from(lists);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const reorderCards = (sourceList, destinationList, sourceIndex, destinationIndex) => {
    const startList = [...lists];
    const sourceListIndex = startList.findIndex(list => list.id === sourceList);
    const destinationListIndex = startList.findIndex(list => list.id === destinationList);

    const [removed] = startList[sourceListIndex].cards.splice(sourceIndex, 1);
    startList[destinationListIndex].cards.splice(destinationIndex, 0, removed);

    return startList;
  };

  const onDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'LIST') {
      setLists(reorderLists(source.index, destination.index));
      return;
    }

    setLists(reorderCards(source.droppableId, destination.droppableId, source.index, destination.index));
  };

  const addList = () => {
    if (!newListTitle.trim()) return;
    setLists(prev => [...prev, { 
      id: uuidv4(),
      title: newListTitle, 
      cards: [] 
    }]);
    setNewListTitle('');
  };

  const deleteList = (listId) => {
    setLists(prev => prev.filter(list => list.id !== listId));
  };

  const addCard = (listId) => {
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? {
            ...list,
            cards: [...list.cards, { 
              id: uuidv4(),
              title: 'New Card',
              description: '',
              dueDate: ''
            }]
          }
        : list
    ));
  };

  const updateCard = (card) => {
    setLists(prev => prev.map(list => ({
      ...list,
      cards: list.cards.map(c => c.id === card.id ? card : c)
    })));
    setIsCardModalOpen(false);
  };

  const deleteCard = (cardId) => {
    setLists(prev => prev.map(list => ({
      ...list,
      cards: list.cards.filter(card => card.id !== cardId)
    })));
    setIsCardModalOpen(false);
  };

  const resetBoard = () => {
    setLists([]);
    localStorage.removeItem('trelloLists');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <header style={{ backgroundColor: colors.primary }} className="shadow p-4 flex justify-between items-center text-white">
        <h1 className="text-xl font-bold">Trello Clone</h1>
        <Button 
          variant="ghost" 
          onClick={resetBoard}
          className="hover:bg-red-500 text-white hover:text-white"
        >
          Reset Board
        </Button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="p-4 overflow-x-auto">
          <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="flex gap-4"
              >
                {lists.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
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
                          <h2 className="font-bold text-gray-700">{list.title}</h2>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteList(list.id)}
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
                              className={`space-y-2 min-h-[50px] rounded-md p-2`}
                              style={{ 
                                backgroundColor: snapshot.isDraggingOver 
                                  ? colors.background
                                  : 'transparent',
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              {list.cards.map((card, index) => (
                                <Draggable
                                  key={card.id}
                                  draggableId={card.id}
                                  index={index}
                                >
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
                                      onClick={() => {
                                        setSelectedCard(card);
                                        setIsCardModalOpen(true);
                                      }}
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
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <Button 
                          variant="ghost" 
                          className="w-full mt-4 text-gray-600 hover:text-gray-800"
                          style={{ backgroundColor: colors.surface }}
                          onClick={() => addCard(list.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Card
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                <div style={{ backgroundColor: colors.secondary }} className="rounded-lg p-4 w-72 flex-shrink-0 shadow-lg">
                  <Input
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    className="mb-2"
                    style={{ backgroundColor: colors.surface }}
                  />
                  <Button 
                    onClick={addList} 
                    className="w-full"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Add List
                  </Button>
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent style={{ backgroundColor: colors.surface }}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <Input
                value={selectedCard.title}
                onChange={(e) => setSelectedCard({
                  ...selectedCard,
                  title: e.target.value
                })}
                placeholder="Card Title"
                style={{ backgroundColor: 'white' }}
              />
              <Textarea
                value={selectedCard.description}
                onChange={(e) => setSelectedCard({
                  ...selectedCard,
                  description: e.target.value
                })}
                placeholder="Description"
                style={{ backgroundColor: 'white' }}
              />
              <Input
                type="date"
                value={selectedCard.dueDate}
                onChange={(e) => setSelectedCard({
                  ...selectedCard,
                  dueDate: e.target.value
                })}
                style={{ backgroundColor: 'white' }}
              />
              <div className="flex justify-between">
                <Button 
                  onClick={() => updateCard(selectedCard)}
                  style={{ backgroundColor: colors.primary }}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => deleteCard(selectedCard.id)}
                >
                  Delete Card
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer style={{ backgroundColor: colors.primary }} className="shadow p-4 text-center text-white">
        Trello Clone - Built with Next.js and shadcn/ui
      </footer>
    </div>
  );
};

export default TrelloBoard;