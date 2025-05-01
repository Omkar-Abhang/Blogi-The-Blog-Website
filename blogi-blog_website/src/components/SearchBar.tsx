'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
     // Optional: Trigger search on input change (debounced would be better)
     // onSearch(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query);
  };

   const handleSearchClick = () => {
     onSearch(query);
   };

  return (
    <form onSubmit={handleSearchSubmit} className="flex w-full max-w-sm items-center space-x-2 mb-6">
      <Input
        type="text"
        placeholder="Search posts by title or content..."
        value={query}
        onChange={handleInputChange}
        className="flex-grow"
        aria-label="Search blog posts"
      />
      <Button type="button" onClick={handleSearchClick} size="icon" aria-label="Submit search">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
