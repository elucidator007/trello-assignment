'use client'
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, X, MoreVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TrelloBoard = () => {
  const [lists, setLists] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trelloLists');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('trelloLists', JSON.stringify(lists));
  }, [lists]);

  const addList = () => {
    if (!newListTitle.trim()) return;
    setLists([...lists, { id: Date.now().toString(), title: newListTitle, cards: [] }]);
    setNewListTitle('');
  };

  const deleteList = (listId) => {
    setLists(lists.filter(list => list.id !== listId));
  };

  const addCard = (listId) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: [...list.cards, { 
            id: Date.now().toString(), 
            title: 'New Card',
            description: '',
            dueDate: ''
          }]
        };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const updateCard = (card) => {
    const updatedLists = lists.map(list => ({
      ...list,
      cards: list.cards.map(c => c.id === card.id ? card : c)
    }));
    setLists(updatedLists);
    setIsCardModalOpen(false);
  };

  const deleteCard = (cardId) => {
    const updatedLists = lists.map(list => ({
      ...list,
      cards: list.cards.filter(card => card.id !== cardId)
    }));
    setLists(updatedLists);
    setIsCardModalOpen(false);
  };

  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === 'LIST') {
      const newLists = Array.from(lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);
      setLists(newLists);
      return;
    }

    const sourceList = lists.find(list => list.id === source.droppableId);
    const destList = lists.find(list => list.id === destination.droppableId);
    const draggingCard = sourceList.cards[source.index];

    const newLists = lists.map(list => {
      if (list.id === source.droppableId) {
        list.cards.splice(source.index, 1);
      }
      if (list.id === destination.droppableId) {
        list.cards.splice(destination.index, 0, draggingCard);
      }
      return list;
    });

    setLists(newLists);
  };

  const resetBoard = () => {
    setLists([]);
    localStorage.removeItem('trelloLists');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Trello Clone</h1>
        <Button variant="destructive" onClick={resetBoard}>Reset Board</Button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="p-4 overflow-x-auto">
          <Droppable droppableId="board" type="LIST" direction="horizontal">
            {(provided) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-4"
              >
                {lists.map((list, index) => (
                  <Draggable 
                    key={list.id} 
                    draggableId={list.id} 
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-200 rounded-lg p-4 w-72 flex-shrink-0"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="font-bold">{list.title}</h2>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteList(list.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <Droppable droppableId={list.id}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {list.cards.map((card, index) => (
                                <Draggable
                                  key={card.id}
                                  draggableId={card.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="bg-white p-3 rounded shadow cursor-pointer"
                                      onClick={() => {
                                        setSelectedCard(card);
                                        setIsCardModalOpen(true);
                                      }}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span>{card.title}</span>
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
                          className="w-full mt-4"
                          onClick={() => addCard(list.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Card
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                <div className="bg-gray-200 rounded-lg p-4 w-72 flex-shrink-0">
                  <Input
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    className="mb-2"
                  />
                  <Button onClick={addList} className="w-full">
                    Add List
                  </Button>
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent>
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
              />
              <Textarea
                value={selectedCard.description}
                onChange={(e) => setSelectedCard({
                  ...selectedCard,
                  description: e.target.value
                })}
                placeholder="Description"
              />
              <Input
                type="date"
                value={selectedCard.dueDate}
                onChange={(e) => setSelectedCard({
                  ...selectedCard,
                  dueDate: e.target.value
                })}
              />
              <div className="flex justify-between">
                <Button onClick={() => updateCard(selectedCard)}>
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

      <footer className="bg-white shadow p-4 text-center text-gray-500">
        Trello Clone - Built with Next.js and shadcn/ui
      </footer>
    </div>
  );
};

export default TrelloBoard;