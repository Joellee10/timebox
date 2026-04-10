import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Plus, X, LogOut, Cloud, CloudOff, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSupabaseSync } from './hooks/useSupabaseSync';

const TimeboxTool = ({ userCode, onSignOut }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({});
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const dateInputRef = useRef(null);

  // ====== Supabase 동기화 ======
  const { isLoading, isSaving, lastSyncError, profile, updateProfile } = useSupabaseSync({
    userCode, data, setData, selectedDate, setSelectedDate
  });


  // ====== 상태 접근 헬퍼 ======
  const getCurrentData = () => {
    return data[selectedDate] || {
      priorities: [],
      brainDump: ['', '', '', '', '', ''],
      timeBlocks: {
        morning: [],
        afternoon1: [],
        afternoon2: []
      }
    };
  };

  const updateData = (field, value) => {
    setData(prev => ({
      ...prev,
      [selectedDate]: {
        ...getCurrentData(),
        [field]: value
      }
    }));
  };

  const addBrainDumpItem = () => {
    const currentData = getCurrentData();
    updateData('brainDump', [...currentData.brainDump, '']);
  };

  // ====== Brain Dump 키보드 처리 (안정화: currentData를 맨 위에서 정의) ======
  const handleBrainDumpKeyDown = (index, e) => {
    const currentData = getCurrentData();

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex < currentData.brainDump.length) {
          const nextInput = document.querySelector(
            `input[data-braindump-index="${nextIndex}"]`
          );
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(0, 0);
          }
        } else {
          addBrainDumpItem();
          setTimeout(() => {
            const newInput = document.querySelector(
              `input[data-braindump-index="${nextIndex}"]`
            );
            if (newInput) {
              newInput.focus();
              newInput.setSelectionRange(0, 0);
            }
          }, 10);
        }
      }, 10);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < currentData.brainDump.length) {
        const nextInput = document.querySelector(
          `input[data-braindump-index="${nextIndex}"]`
        );
        if (nextInput) {
          nextInput.focus();
          setTimeout(() => {
            nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
          }, 0);
        }
      } else if (nextIndex === currentData.brainDump.length) {
        addBrainDumpItem();
        setTimeout(() => {
          const newInput = document.querySelector(
            `input[data-braindump-index="${nextIndex}"]`
          );
          if (newInput) newInput.focus();
        }, 10);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        const prevInput = document.querySelector(
          `input[data-braindump-index="${prevIndex}"]`
        );
        if (prevInput) {
          prevInput.focus();
          setTimeout(() => {
            prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
          }, 0);
        }
      }
    } else if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      const item = currentData.brainDump[index];
      if (item.trim() && currentData.priorities.length < 3) {
        const newPriorities = [...currentData.priorities, item.trim()];
        const newBrainDump = currentData.brainDump.filter((_, i) => i !== index);
        const newData = {
          ...currentData,
          priorities: newPriorities,
          brainDump: newBrainDump
        };
        setData(prev => ({
          ...prev,
          [selectedDate]: newData
        }));
        setTimeout(() => {
          let nextFocusIndex = index;
          if (nextFocusIndex >= newBrainDump.length) {
            nextFocusIndex = Math.max(0, newBrainDump.length - 1);
          }
          const nextInput = document.querySelector(
            `input[data-braindump-index="${nextFocusIndex}"]`
          );
          if (nextInput) nextInput.focus();
        }, 10);
      }
    }
  };

  const updateBrainDumpItem = (index, value) => {
    const currentData = getCurrentData();
    const newBrainDump = [...currentData.brainDump];
    newBrainDump[index] = value;
    updateData('brainDump', newBrainDump);
  };

  const removeBrainDumpItem = (index) => {
    const currentData = getCurrentData();
    const newBrainDump = currentData.brainDump.filter((_, i) => i !== index);
    updateData('brainDump', newBrainDump);
  };

  const moveToPriority = (brainDumpIndex) => {
    const currentData = getCurrentData();
    const item = currentData.brainDump[brainDumpIndex];
    if (item.trim() && currentData.priorities.length < 3) {
      const newPriorities = [...currentData.priorities, item.trim()];
      const newBrainDump = currentData.brainDump.filter((_, i) => i !== brainDumpIndex);
      const newData = {
        ...currentData,
        priorities: newPriorities,
        brainDump: newBrainDump
      };
      setData(prev => ({
        ...prev,
        [selectedDate]: newData
      }));
    }
  };

  const updatePriority = (index, value) => {
    const currentData = getCurrentData();
    const newPriorities = [...currentData.priorities];
    newPriorities[index] = value;
    updateData('priorities', newPriorities);
  };

  const removePriority = (index) => {
    const currentData = getCurrentData();
    const newPriorities = currentData.priorities.filter((_, i) => i !== index);
    updateData('priorities', newPriorities);
  };

  // ====== Drag & Drop (Priorities) ======
  const handlePriorityDragStart = (index) => {
    const currentData = getCurrentData();
    setDraggedIndex(index);
    setDraggedItem({ type: 'priority', index, content: currentData.priorities[index] });
  };

  const handlePriorityDragOver = (e) => {
    e.preventDefault();
  };

  const handlePriorityDrop = (dropIndex) => {
    if (draggedIndex === null || draggedItem?.type !== 'priority') return;
    const currentData = getCurrentData();
    const newPriorities = [...currentData.priorities];
    const draggedContent = newPriorities[draggedIndex];
    newPriorities.splice(draggedIndex, 1);
    newPriorities.splice(dropIndex, 0, draggedContent);
    updateData('priorities', newPriorities);
    setDraggedIndex(null);
    setDraggedItem(null);
  };

  // ====== Drag & Drop (Time Blocks) ======
  const handleTimeBlockDragStart = (timeBlock, index) => {
    const currentData = getCurrentData();
    setDraggedItem({
      type: 'timeblock',
      timeBlock,
      index,
      content: currentData.timeBlocks[timeBlock][index]
    });
  };

  const toggleTaskDone = (timeBlock, index) => {
    const currentData = getCurrentData();
    const newTimeBlocks = { ...currentData.timeBlocks };
    const item = newTimeBlocks[timeBlock][index];
    if (typeof item === 'string') {
      newTimeBlocks[timeBlock][index] = { text: item, done: true };
    } else {
      newTimeBlocks[timeBlock][index] = { ...item, done: !item.done };
    }
    setData(prev => ({
      ...prev,
      [selectedDate]: { ...currentData, timeBlocks: newTimeBlocks }
    }));
  };

  const handleTimeBlockDragOver = (e) => {
    e.preventDefault();
  };

  const handleTimeBlockDrop = (targetTimeBlock, dropIndex = null) => {
    if (!draggedItem) return;
    const currentData = getCurrentData();
    let newData = { ...currentData };

    if (draggedItem.type === 'priority') {
      if (newData.timeBlocks[targetTimeBlock].length < 3) {
        const content = { text: draggedItem.content, done: false };
        newData.timeBlocks[targetTimeBlock] = [
          ...newData.timeBlocks[targetTimeBlock],
          content
        ];
        newData.priorities = newData.priorities.filter((_, i) => i !== draggedItem.index);
      }
    } else if (draggedItem.type === 'timeblock') {
      if (targetTimeBlock !== draggedItem.timeBlock &&
          newData.timeBlocks[targetTimeBlock].length < 3) {
        const content = draggedItem.content;
        newData.timeBlocks[draggedItem.timeBlock] =
          newData.timeBlocks[draggedItem.timeBlock].filter((_, i) => i !== draggedItem.index);
        newData.timeBlocks[targetTimeBlock] = [
          ...newData.timeBlocks[targetTimeBlock],
          content
        ];
      } else if (targetTimeBlock === draggedItem.timeBlock && dropIndex !== null) {
        const items = [...newData.timeBlocks[targetTimeBlock]];
        const draggedContent = items[draggedItem.index];
        items.splice(draggedItem.index, 1);
        items.splice(dropIndex, 0, draggedContent);
        newData.timeBlocks[targetTimeBlock] = items;
      }
    }

    setData(prev => ({
      ...prev,
      [selectedDate]: newData
    }));
    setDraggedItem(null);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedIndex(null);
  };

  const removeFromTimeBlock = (timeBlock, index) => {
    const currentData = getCurrentData();
    const newTimeBlocks = {
      ...currentData.timeBlocks,
      [timeBlock]: currentData.timeBlocks[timeBlock].filter((_, i) => i !== index)
    };
    updateData('timeBlocks', newTimeBlocks);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const navigateDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const currentData = getCurrentData();

  const TimeBlockSection = ({ title, timeRange, blockKey }) => (
    <div className="border-l-4 border-gray-300 pl-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-700">
          {title} <span className="text-sm font-normal text-gray-400">({timeRange})</span>
        </h3>
        <span className="text-sm text-gray-400">
          {currentData.timeBlocks[blockKey].length}/3
        </span>
      </div>
      <div
        className={`space-y-2 mb-3 min-h-[120px] sm:min-h-[200px] p-3 rounded-lg border-2 border-dashed border-gray-200 transition-colors duration-150 ${
          draggedItem && (
            draggedItem.type === 'priority' ||
            (draggedItem.type === 'timeblock' && draggedItem.timeBlock !== blockKey)
          ) && currentData.timeBlocks[blockKey].length < 3
            ? 'border-gray-400 bg-gray-50'
            : ''
        }`}
        onDragOver={handleTimeBlockDragOver}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleTimeBlockDrop(blockKey);
        }}
      >
        {currentData.timeBlocks[blockKey].map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleTimeBlockDragStart(blockKey, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:shadow-sm transition-all ${
              draggedItem?.type === 'timeblock' && draggedItem.timeBlock === blockKey && draggedItem.index === index
                ? 'opacity-50'
                : ''
            } ${(item.done || false) ? 'opacity-75' : ''}`}
          >
            <input
              type="checkbox"
              checked={item.done || false}
              onChange={() => toggleTaskDone(blockKey, index)}
              className="w-5 h-5 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-gray-400 transition-colors accent-gray-600"
            />
            <span className={`flex-1 text-sm font-semibold ${(item.done || false) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {item.text || item}
            </span>
            <button
              onClick={() => removeFromTimeBlock(blockKey, index)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {currentData.timeBlocks[blockKey].length === 0 && (
          <div className="text-center text-gray-400 py-8">
            우선순위를 여기로 드래그하세요
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4">
        {/* 제목 + 문구 */}
        <div className="mb-2">
          <input
            value={profile.title}
            onChange={(e) => updateProfile({ ...profile, title: e.target.value })}
            placeholder="나의 Timebox"
            className="text-lg sm:text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none w-full"
          />
          <input
            value={profile.subtitle}
            onChange={(e) => updateProfile({ ...profile, subtitle: e.target.value })}
            placeholder="한 줄 문구를 입력하세요"
            className="text-xs sm:text-sm text-gray-500 italic mt-1 bg-transparent border-none focus:outline-none w-full"
          />
        </div>

        {/* 날짜 + 버튼 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <button onClick={() => navigateDate(-1)} className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => dateInputRef.current?.showPicker()}
              className="text-sm sm:text-base text-gray-700 font-medium hover:text-blue-600 transition-colors truncate"
            >
              {formatDate(selectedDate)}
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute opacity-0 w-0 h-0"
            />
            <button onClick={() => navigateDate(1)} className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center" title={lastSyncError || ''}>
              {isSaving ? (
                <Loader className="w-4 h-4 text-blue-500 animate-spin" />
              ) : lastSyncError ? (
                <CloudOff className="w-4 h-4 text-red-500" />
              ) : (
                <Cloud className="w-4 h-4 text-green-500" />
              )}
            </div>
            <button
              onClick={onSignOut}
              className="p-1.5 text-gray-500 hover:text-gray-700"
              title="나가기"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Brain Dump → Priorities → Time Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {/* Brain Dump (1단계: 아이디어 수집) */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 min-h-[250px] lg:h-[380px]">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-semibold text-gray-800">Brain Dump</h2>
              <button
                onClick={addBrainDumpItem}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {currentData.brainDump.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateBrainDumpItem(index, e.target.value)}
                    onKeyDown={(e) => handleBrainDumpKeyDown(index, e)}
                    data-braindump-index={index}
                    placeholder="태스크를 적어보세요..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                  <button
                    onClick={() => moveToPriority(index)}
                    disabled={!item.trim() || currentData.priorities.length >= 3}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                    title="우선순위로 이동"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeBrainDumpItem(index)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Cmd+P: 우선순위로 이동 / Enter: 다음 줄</p>
            </div>
          </div>

          {/* Top 3 Priorities (2단계: 우선순위 선정 → Time Block으로 드래그) */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 min-h-[200px] lg:h-[360px] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Top 3 Priorities <span className="text-sm font-normal text-gray-400">{currentData.priorities.length}/3</span>
            </h2>
            <div className="space-y-3">
              {currentData.priorities.map((priority, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handlePriorityDragStart(index)}
                  onDragOver={handlePriorityDragOver}
                  onDrop={() => handlePriorityDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:shadow-sm transition-all ${
                    draggedItem?.type === 'priority' && draggedItem.index === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <span className="w-7 h-7 bg-gray-700 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    value={priority}
                    onChange={(e) => updatePriority(index, e.target.value)}
                    className="flex-1 p-1 border-none bg-transparent focus:outline-none text-sm"
                    placeholder={`Priority ${index + 1}...`}
                  />
                  <button
                    onClick={() => removePriority(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {currentData.priorities.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Brain Dump에서 추가하세요</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Time Blocks (3단계: 시간에 배치) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
              Time Blocks
            </h2>

            <div className="space-y-6">
              <TimeBlockSection title="오전" timeRange="10:00 - 13:00" blockKey="morning" />
              <TimeBlockSection title="오후 1" timeRange="14:00 - 16:30" blockKey="afternoon1" />
              <TimeBlockSection title="오후 2" timeRange="16:30 - 19:00" blockKey="afternoon2" />
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      {Object.keys(data).length > 0 && (
        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 History</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(data)
              .sort((a, b) => new Date(b) - new Date(a))
              .slice(0, 10)
              .map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    date === selectedDate
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {new Date(date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </button>
              ))}
          </div>

          {/* Selected Date Tasks Overview */}
          {(() => {
            const selectedData = data[selectedDate];
            if (!selectedData) return null;

            const allTasks = [
              ...(selectedData.timeBlocks?.morning || []),
              ...(selectedData.timeBlocks?.afternoon1 || []),
              ...(selectedData.timeBlocks?.afternoon2 || [])
            ].filter(task => task && (task.text || task));

            if (allTasks.length === 0) return null;

            const completedTasks = allTasks.filter(task => task.done);
            const pendingTasks = allTasks.filter(task => !task.done);

            return (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-4 mb-3">
                  <h4 className="font-medium text-gray-700">
                    {new Date(selectedDate).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })} 작업 현황
                  </h4>
                  <div className="flex gap-3 text-sm">
                    <span className="text-green-600">✅ {completedTasks.length}개 완료</span>
                    <span className="text-orange-600">⏳ {pendingTasks.length}개 미완료</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedTasks.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-green-700 mb-2">완료된 작업</h5>
                      <div className="space-y-1">
                        {completedTasks.map((task, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-green-600">✅</span>
                            <span className="line-through text-gray-600">
                              {task.text || task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingTasks.length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-orange-700 mb-2">미완료 작업</h5>
                      <div className="space-y-1">
                        {pendingTasks.map((task, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-orange-600">⏳</span>
                            <span className="text-gray-800 font-medium">
                              {task.text || task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TimeboxTool;