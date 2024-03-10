"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Badge, Box, Checkbox, Divider, IconButton, LinearProgress, List, ListItemAvatar, ListItemButton,
  ListItemIcon, ListItemText, Skeleton, Stack, Tooltip, Typography
} from "@mui/material";
import { CheckCircleOutline, DateRange, Flag, FlagOutlined, Forum, NavigateBefore, NavigateNext, Refresh, Tag } from "@mui/icons-material";
import AwesomeAvatar from "./components/AwesomeAvatar";
import AwsomeFilterOptions from "./components/AwesomeFilterOptions/AwesomeFilterOptions";
import AwesomeInputBase from "./components/AwesomeInputBase";
import { useResolveTickets, useFlagTickets, useTickets } from "../../queries/ticket.queries";
import DiscordIcon from "../../components/DiscordIcon";
import useConfirm from "../../components/AwesomeConfirmModal/AwesomeConfirmModal";

import { Ticket } from "../../types";

export default function Tickets() {

  const confirm = useConfirm();

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page: number = searchParams?.get("page") ? parseInt(searchParams?.get("page") || "0") : 1;
  const query = searchParams?.get("query") || "";
  const flagged: boolean = searchParams?.get("flagged") == "true";
  const author: string = searchParams?.get("author") || "";
  const channel: string = searchParams?.get("channel") || "";

  const { tickets, refetch, loading, enabled, setEnabled, size } = useTickets({ page, flagged, author, channel });
  const flagTickets = useFlagTickets();
  const resolveTickets = useResolveTickets(refetch);

  const [rowSelection, setRowSelection] = useState<string[]>([]);
  const [ticketsToDisplay, setTicketsToDisplay] = useState<Ticket[]>([]);
  const [filterOptionsOpen, setFilterOptionsOpen] = useState(false);

  const flag = !rowSelection?.every((ticket) => ticketsToDisplay?.find((t) => t._id === ticket)?.flagged);



  useEffect(() => {
    if (searchParams?.size > 0) {
      if (!enabled) {
        setEnabled(true);
      }
    }
  }, [searchParams?.size]);

  useEffect(() => {
    setTicketsToDisplay(tickets?.data || []);
  }, [tickets?.data]);

  useEffect(() => {

    if (page && tickets?.total_count && (page > Math.ceil(tickets?.total_count / size))) {
      onPageChange(Math.ceil(tickets?.total_count / size));
    }
  }, [tickets?.total_count, page]);

  const handleClickFlag = (_id) => {
    flagTickets([_id], !ticketsToDisplay.find((ticket) => ticket._id === _id)?.flagged);
    setTicketsToDisplay(ticketsToDisplay.map((ticket) => {
      if (ticket._id == _id) {
        ticket.flagged = !ticket.flagged;
      }
      return ticket;
    }
    ));
  }

  const handleFlagMultiple = () => {

    setTicketsToDisplay(ticketsToDisplay.map((ticket) => {
      if (rowSelection.indexOf(ticket._id) !== -1) return { ...ticket, flagged: flag };
      return ticket;
    }))

    flagTickets(rowSelection, flag);
  }

  const handleResolveMultiple = () => {
    confirm.confirm({
      title: "Resolve Tickets",
      message: `Are you sure you want to resolve ${rowSelection.length} tickets? `,
      confirmText: "Resolve",
      cancelText: "Cancel"
    }).then((result) => {
      if (result) {
        setRowSelection([]);
        resolveTickets(rowSelection);
      }
    });
  }

  const handleResolve = (id) => {
    confirm.confirm({
      title: "Resolve Ticket",
      message: `Are you sure you want to resolve this ticket? `,
      confirmText: "Delete",
      cancelText: "Cancel"
    }).then((result) => {
      if (result) {
        setRowSelection(rowSelection.filter((id) => id !== id));
        resolveTickets([id]);
      }
    });
  }

  const onPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(
      `${pathname}?${params.toString()}`
    );
  }

  const onQueryChange = (newQuery) => {
    const params = new URLSearchParams(searchParams);

    if (query == newQuery) return;
    params.set("query", newQuery);

    router.replace(`${pathname}?${params.toString()}`);
  }

  console.log("rowSelection", rowSelection);

  return (
    <>
      <Box sx={{ overflow: "auto", height: "-webkit-fill-available", position: "relative" }}>
        <AwsomeFilterOptions
          open={filterOptionsOpen}
          onClose={() => setFilterOptionsOpen(!filterOptionsOpen)}
        />
        <Box sx={{
          position: "sticky", top: "0px", zIndex: 1000, backdropFilter: "blur(10px)"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 1, }}>
            <Stack direction={"row"} alignItems={"center"}>
              <Checkbox
                edge="start"
                tabIndex={-1}
                disableRipple
                checked={rowSelection.length > 0 && rowSelection.length === ticketsToDisplay.length}
                indeterminate={rowSelection.length > 0 && rowSelection.length < ticketsToDisplay.length}
                sx={{ ml: "4px" }}
                onChange={(event) => {
                  setRowSelection(event.target.checked ? ticketsToDisplay.map((ticket) => ticket._id) : []);
                }}
              />

              <Divider orientation="vertical" flexItem sx={{ margin: 1 }} />
              <Tooltip title="Refresh">
                <IconButton
                  onClick={() => refetch()}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              {rowSelection?.length ?
                <>
                  <Tooltip title="Resolve All">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolveMultiple();
                      }}
                    >
                      <CheckCircleOutline />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={flag ? "Flag All" : "Remove Flag All"}>
                    <IconButton
                      onClick={() => {
                        handleFlagMultiple();
                        setRowSelection([]);
                      }}
                    >
                      {flag ? <FlagOutlined /> : <Flag color="error" />}
                    </IconButton>
                  </Tooltip>
                </> : null
              }
            </Stack>
            <Stack direction={"row"} alignItems={"center"}>
              <AwesomeInputBase
                onClickFilterOptions={() => setFilterOptionsOpen(true)}
                onQueryChange={(query) => onQueryChange(query)}
                queryDefault={query}
                activeFilterCount={searchParams?.size - 1 + (flagged ? 1 : 0)}
              />
              <Typography
                fontSize={"0.75em"}
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {(tickets?.total_count == null || tickets?.total_count == undefined) ? <Skeleton width={90} /> : `${(page - 1) * size}-${Math.min(page * size, tickets?.total_count)} of ${tickets?.total_count}`}
              </Typography>
              <IconButton
                size="small"
                disabled={page == 1}
                onClick={() => {
                  if (page == 1) return;
                  onPageChange(page - 1)
                }}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton
                size="small"
                disabled={page * size >= (tickets?.total_count || 0)}
                onClick={() => {
                  if (page * size >= (tickets?.total_count || 0)) return;
                  onPageChange(page + 1)
                }}>
                <NavigateNext />
              </IconButton>
            </Stack>
          </Box>
          <Divider />
          {
            loading && <Box sx={{ width: '100%', position: "absolute", bottom: 0 }}>
              <LinearProgress />
            </Box>
          }
        </Box>
        <Box >
          <List>
            {
              ticketsToDisplay ?
                ticketsToDisplay.map((ticket) => (
                  <ListItemButton
                    key={ticket._id}
                    onClick={() => {
                      router.push(`/tickets/${ticket._id}`);
                    }}
                    sx={{
                      '&:hover': {
                        '& .button-box': {
                          display: 'block',
                        },
                        '& .MuiTooltip-popper': {
                          display: "flex",
                        },
                        '& .date': {
                          display: 'none',
                        }
                      },
                    }}
                  >
                    <ListItemIcon onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
                      <Checkbox
                        edge="start"
                        checked={rowSelection.indexOf(ticket._id) !== -1}
                        tabIndex={-1}
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          setRowSelection(rowSelection.indexOf(ticket._id) !== -1 ? rowSelection.filter((id) => id !== ticket._id) : [...rowSelection, ticket._id]);
                        }}
                      />
                    </ListItemIcon>
                    <ListItemAvatar>
                      <AwesomeAvatar
                        src={ticket?.message?.author?.avatar_url}
                        fallbackColor={ticket?.message?.author?.color}
                        fallbackLetter={ticket?.message?.author?.name[0]}
                        uniqueKey={ticket?.message?.author?.id}
                      />
                    </ListItemAvatar>
                    <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} flex={1}>
                      <ListItemText
                        primary={
                          <Stack direction={"row"} gap={1}>
                            <>
                              {ticket?.message?.author?.name}
                              <Typography
                                // className="date"
                                variant="caption"
                                sx={{ display: "flex", alignItems: "center", fontWeight: "bold", color: "text.secondary" }}
                              >
                                <Tag fontSize="inherit" /> {ticket?.message?.channel_id}
                              </Typography>
                            </>
                            <Typography
                              // className="date"
                              variant="caption"
                              sx={{ display: "flex", alignItems: "center", fontWeight: "bold", color: "text.secondary" }}
                            >
                              <Forum fontSize="inherit" /> {ticket?.context_messages?.length}
                            </Typography>
                          </Stack >
                        }
                        secondary={
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <span>
                              <Badge color="error" variant="dot"
                                anchorOrigin={{
                                  vertical: 'top',
                                  horizontal: 'left',
                                }}
                                sx={{
                                  '& .MuiBadge-badge': {
                                    top: "4px",
                                    left: "-1px",
                                    padding: '0 4px',
                                    display: ticket.flagged ? "block" : "none"
                                  },
                                }}
                              >
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >

                                  {ticket?.message?.content}
                                </Typography>
                              </Badge>
                            </span>
                            <Typography
                              className="date"
                              variant="caption"
                              sx={{ display: "flex", alignItems: "center", marginLeft: 1, textWrap: "nowrap" }}
                            >
                              <DateRange sx={{ fontSize: "inherit" }} />
                              &nbsp;
                              {format(new Date(ticket.timestamp), "MMMM d, yyyy")}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box className="button-box" sx={{ display: "none", minWidth: "114px" }}>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClickFlag(ticket._id)
                          }}
                        >
                          {ticket.flagged ? <Flag color="error" /> : <FlagOutlined />}
                        </IconButton>
                        <Link
                          target="_blank"
                          href={ticket?.message?.msg_url}
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              transition: "all 0.3s",
                              '&:hover': {
                                color: "#5865F2"
                              }
                            }}
                          >
                            <DiscordIcon />
                          </IconButton>
                        </Link>
                        <IconButton
                          size="small"
                          sx={{
                            transition: "all 0.3s",
                            '&:hover': {
                              color: "green"
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(ticket._id);
                          }}
                        >
                          <CheckCircleOutline />
                        </IconButton>
                      </Box>
                    </Stack>
                  </ListItemButton>
                )) :
                Array.from(Array(50).keys()).map((ticket) => {
                  return <Skeleton key={`skeleton-${ticket}`} variant="rectangular" height={72} sx={{ margin: 1 }} />
                })
            }
          </List>
        </Box>

      </Box >
    </>
  );
}