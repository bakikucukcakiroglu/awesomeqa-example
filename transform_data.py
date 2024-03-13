import json


def transform_json(input_file, output_folder):
    with open(input_file, "r") as f:
        data = json.load(f)

    # Assuming data is a dictionary with "tickets" and "messages" keys
    tickets = data["tickets"]
    messages = data["messages"]

    for item in tickets + messages:
        if "id" in item:
            item["_id"] = item.pop("id")

    with open(f"{output_folder}/tickets.json", "w") as f:
        json.dump(tickets, f, indent=4)

    with open(f"{output_folder}/messages.json", "w") as f:
        json.dump(messages, f, indent=4)


# Usage example:
transform_json("./data/awesome_tickets.json", "./mongo-seed/data")
