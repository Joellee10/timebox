import React, { useState } from 'react';
import {
  Home,
  ListTodo,
  Archive,
  Clock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Header from '../shared/Header';
import BrainDump from '../shared/BrainDump';
import Priorities from '../shared/Priorities';
import TimeBlockSection from '../shared/TimeBlockSection';
import HistorySection from '../shared/HistorySection';
import { card, sectionHeading, iconButton, mutedText } from '../../ui/styles';

const TABS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'tasks', label: 'Tasks', icon: ListTodo },
  { key: 'menu', label: 'My Box', icon: Archive },
];

const MENU_ITEMS = [
  { key: 'history', label: 'History', icon: Clock },
  { key: 'feedback', label: '고객 의견', icon: MessageSquare },
];

export default function TimeboxMobile({ timebox, onSignOut }) {
  const [activeTab, setActiveTab] = useState('home');
  const [menuView, setMenuView] = useState('root');

  const goToTab = (key) => {
    setActiveTab(key);
    if (key !== 'menu') setMenuView('root');
  };

  const {
    data,
    selectedDate,
    setSelectedDate,
    currentData,
    draggedItem,
    isSaving,
    lastSyncError,
    profile,
    updateProfile,
    addBrainDumpItem,
    updateBrainDumpItem,
    removeBrainDumpItem,
    moveToPriority,
    updatePriority,
    removePriority,
    movePriorityToBlock,
    handleBrainDumpKeyDown,
    handlePriorityDragStart,
    handlePriorityDragOver,
    handlePriorityDrop,
    handleTimeBlockDragStart,
    handleTimeBlockDragOver,
    handleTimeBlockDrop,
    handleDragEnd,
    toggleTaskDone,
    removeFromTimeBlock,
    navigateDate,
  } = timebox;

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans flex flex-col pb-20">
      <div className="p-3">
        {activeTab === 'home' && (
          <Header
            profile={profile}
            updateProfile={updateProfile}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            navigateDate={navigateDate}
            isSaving={isSaving}
            lastSyncError={lastSyncError}
            onSignOut={onSignOut}
          />
        )}

        {activeTab === 'home' && (
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="space-y-4">
              <TimeBlockSection
                title="오전"
                timeRange="10:00 - 13:00"
                blockKey="morning"
                items={currentData.timeBlocks.morning}
                draggedItem={draggedItem}
                onDragOver={handleTimeBlockDragOver}
                onDrop={handleTimeBlockDrop}
                onItemDragStart={handleTimeBlockDragStart}
                onItemDragEnd={handleDragEnd}
                onToggleDone={toggleTaskDone}
                onRemove={removeFromTimeBlock}
              />
              <TimeBlockSection
                title="오후 1"
                timeRange="14:00 - 16:30"
                blockKey="afternoon1"
                items={currentData.timeBlocks.afternoon1}
                draggedItem={draggedItem}
                onDragOver={handleTimeBlockDragOver}
                onDrop={handleTimeBlockDrop}
                onItemDragStart={handleTimeBlockDragStart}
                onItemDragEnd={handleDragEnd}
                onToggleDone={toggleTaskDone}
                onRemove={removeFromTimeBlock}
              />
              <TimeBlockSection
                title="오후 2"
                timeRange="16:30 - 19:00"
                blockKey="afternoon2"
                items={currentData.timeBlocks.afternoon2}
                draggedItem={draggedItem}
                onDragOver={handleTimeBlockDragOver}
                onDrop={handleTimeBlockDrop}
                onItemDragStart={handleTimeBlockDragStart}
                onItemDragEnd={handleDragEnd}
                onToggleDone={toggleTaskDone}
                onRemove={removeFromTimeBlock}
              />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <h1 className="text-lg font-bold text-gray-800 px-1">Tasks</h1>
            <BrainDump
              items={currentData.brainDump}
              priorities={currentData.priorities}
              onAdd={addBrainDumpItem}
              onUpdate={updateBrainDumpItem}
              onRemove={removeBrainDumpItem}
              onMoveToPriority={moveToPriority}
              onKeyDown={handleBrainDumpKeyDown}
              showKeyboardHints={false}
            />
            <Priorities
              priorities={currentData.priorities}
              timeBlocks={currentData.timeBlocks}
              draggedItem={draggedItem}
              onDragStart={handlePriorityDragStart}
              onDragOver={handlePriorityDragOver}
              onDrop={handlePriorityDrop}
              onDragEnd={handleDragEnd}
              onUpdate={updatePriority}
              onRemove={removePriority}
              onMoveToBlock={movePriorityToBlock}
            />
          </div>
        )}

        {activeTab === 'menu' && menuView === 'root' && (
          <div className="space-y-4">
            <h1 className="text-lg font-bold text-gray-800 px-1">My Box</h1>
            <div className={card}>
              <ul className="divide-y divide-gray-100">
              {MENU_ITEMS.map(({ key, label, icon: Icon }) => (
                <li key={key}>
                  <button
                    onClick={() => setMenuView(key)}
                    className="w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50 rounded-lg px-1 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="flex-1 text-sm text-gray-800">{label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                </li>
              ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'menu' && menuView !== 'root' && (
          <div className="space-y-3">
            <button
              onClick={() => setMenuView('root')}
              className={`flex items-center gap-1 text-sm ${iconButton}`}
            >
              <ChevronLeft className="w-4 h-4" />
              {MENU_ITEMS.find((m) => m.key === menuView)?.label}
            </button>

            {menuView === 'history' && (
              <HistorySection
                data={data}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                showHeading={false}
              />
            )}

            {menuView === 'feedback' && (
              <div className={card}>
                <h2 className={sectionHeading}>고객 의견</h2>
                <p className={mutedText}>준비 중입니다.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around pt-2 pb-safe z-10">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => goToTab(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
