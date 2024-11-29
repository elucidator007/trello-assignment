'use client'
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { List } from './List';
import { colors } from '@/lib/constants';

export const TrelloBoard = () => {
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

  const updateListTitle = (listId, newTitle) => {
    setLists(prev => prev.map(list => 
      list.id === listId ? { ...list, title: newTitle } : list
    ));
  };

  const resetBoard = () => {
    setLists([]);
    localStorage.removeItem('trelloLists');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
      <header style={{ backgroundColor: colors.primary }} className="shadow p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z"/>
            </svg>
            <h1 className="text-xl font-bold">Trello Borad - Task Management</h1>
        </div>
        <Button 
            variant="ghost" 
            onClick={resetBoard}
            className="hover:bg-red-500 text-white hover:text-white"
        >
            Reset Board
        </Button>
    </header>

      <main className="flex-1 p-4 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="flex gap-4"
              >
                {lists.map((list, index) => (
                  <List
                    key={list.id}
                    list={list}
                    index={index}
                    onDeleteList={deleteList}
                    onAddCard={addCard}
                    onCardClick={(card) => {
                      setSelectedCard(card);
                      setIsCardModalOpen(true);
                    }}
                    onUpdateTitle={updateListTitle}
                  />
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
        </DragDropContext>
      </main>

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

      <footer style={{ backgroundColor: colors.primary }} className="shadow p-4 text-center text-white mt-auto">
        <p>Trello Clone - Built with Next.js and shadcn/ui</p>
        <p>Drag n Drop library used - @hello-pangea</p>
        <p>built by - Ankush Sangwan</p>
      </footer>
    </div>
  );
};