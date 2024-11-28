def store_data(session, state, key, data):
    if session in state.content:
        state.content[session][key] = data
    else:
        state.content[session] = {}
        state.content[session][key] = data


def retrieve_data(session, state, key=""):
    if session in state.content:
        if key == "":
            return state.content[session]
        elif key in state.content[session]:
            return state.content[session][key]
        else:
            return None
    else:
        return None


def delete_data(session, state):
    if session in state.content:
        state.content[session] = {}
