import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styled from "@emotion/styled";
import { Badge, BadgeProps, IconButton, InputBase, Paper } from "@mui/material";
import { Search, Tune } from "@mui/icons-material";

type CustomizedInputBaseProps = {
  onClickFilterOptions: () => void;
  onQueryChange: (query: string) => void;
  queryDefault: string;
  activeFilterCount: number;
};

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 5,
    top: 10,
  },
}));

export default function AwesomeInputBase({ onClickFilterOptions, onQueryChange, queryDefault, activeFilterCount }: CustomizedInputBaseProps) {

  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(queryDefault);


  useEffect(() => {
    setQuery(queryDefault);
  }, [queryDefault]);

  useEffect(() => {
    if (query == null || query == undefined) return;
    const timeOutId = setTimeout(() => onQueryChange(query), 500);
    return () => clearTimeout(timeOutId);
  }, [query]);

  return (
    <Paper
      component="form"
      sx={{ display: 'flex', alignItems: 'center', width: 300, m: 1, position: "sticky", top: 0 }}
    >
      <IconButton aria-label="menu">
        <Search />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search for tickets"
        inputProps={{ 'aria-label': 'search google maps' }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <IconButton type="button" id="filter-options-anchor" aria-label="search" onClick={onClickFilterOptions}>
        <Badge
          color="secondary"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          badgeContent={activeFilterCount}
        >
          <Tune />
        </Badge>
      </IconButton>
    </Paper>
  );
}