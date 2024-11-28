// Board.js
'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { List } from './List';
import { CardModal } from './CardModal';

const Board = () => {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('trelloBoard');
    if (saved) setLists(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('trelloBoard', JSON.stringify(lists));
  }, [lists]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;

    const start = lists.find(list => list.id === source.droppableId);
    const finish = lists.find(list => list.id === destination.droppableId);

    if (type === 'COLUMN') {
      const newLists = Array.from(lists);
      newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, lists[source.index]);
      setLists(newLists);
      return;
    }

    if (start === finish) {
      const newCards = Array.from(start.cards);
      newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, start.cards[source.index]);
      
      const newList = {
        ...start,
        cards: newCards
      };

      setLists(lists.map(list => 
        list.id === newList.id ? newList : list
      ));
      return;
    }

    const startCards = Array.from(start.cards);
    startCards.splice(source.index, 1);
    const newStart = {
      ...start,
      cards: startCards
    };

    const finishCards = Array.from(finish.cards);
    finishCards.splice(destination.index, 0, start.cards[source.index]);
    const newFinish = {
      ...finish,
      cards: finishCards
    };

    setLists(lists.map(list => {
      if (list.id === newStart.id) return newStart;
      if (list.id === newFinish.id) return newFinish;
      return list;
    }));
  };

  const handleAddList = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    const newList = {
      id: `list-${Date.now()}`,
      title: newListTitle,
      cards: []
    };
    setLists([...lists, newList]);
    setNewListTitle('');
  };

  const handleAddCard = (listId, cardTitle) => {
    setLists(lists.map(list => 
      list.id === listId ? {
        ...list,
        cards: [...list.cards, { id: `card-${Date.now()}`, title: cardTitle }]
      } : list
    ));
  };

  const handleDeleteList = (listId) => {
    setLists(lists.filter(list => list.id !== listId));
  };

  const handleUpdateCard = (listId, cardId, updatedCard) => {
    setLists(lists.map(list => 
      list.id === listId ? {
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, ...updatedCard } : card
        )
      } : list
    ));
  };

  const handleDeleteCard = (listId, cardId) => {
    setLists(lists.map(list => 
      list.id === listId ? {
        ...list,
        cards: list.cards.filter(card => card.id !== cardId)
      } : list
    ));
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Trello Clone</h1>
          <button 
            onClick={() => setLists([])} 
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reset Board
          </button>
        </div>
      </header>

      <main className="p-4 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
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
                    onAddCard={handleAddCard}
                    onDeleteList={handleDeleteList}
                    onCardClick={(card) => {
                      setSelectedCard(card);
                      setSelectedListId(list.id);
                    }}
                  />
                ))}
                {provided.placeholder}
                <form onSubmit={handleAddList} className="bg-gray-100 rounded p-4 w-72 h-fit">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Enter list title..."
                  />
                  <button 
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                  >
                    Add List
                  </button>
                </form>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          listId={selectedListId}
          onClose={() => {
            setSelectedCard(null);
            setSelectedListId(null);
          }}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
};

export default Board;