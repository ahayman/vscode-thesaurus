# Merriam-Webster Thesaurus

This is an extension for retrieving either synonyms or antonyms from the Merriam-Webster Thesaurus API: [https://dictionaryapi.com](https://dictionaryapi.com). Results are groups by word definition, and provide numbering prefixes for easy selection/filtering.

Warning: The Merriam-Webster API only handles English.

## Requirements

You must have an API key in order to use the API. Keys are free, but have usage restrictions (ex: 1000 requests/day). This should be sufficient for most individuals. To get a key, you must register here: [https://dictionaryapi.com/register/index](https://dictionaryapi.com/register/index). The extension will ask for your key when you first attempt to use it. After that, you can change your key by updating the `"mw-thesaurus.key"` key in your settings.

## Features

### Dynamic Selection

The extension will attempt to retrieve a word to use, and replace it with your selection:

 - If you have highlighted a selection, it will use that for your word, and replace the selection with your choice.
 - It there is no selection, it will attempt to get the word under the cursor, and replace that word with your choice.
 - If that fails, it will prompt you for a word, and _insert_ your choice at the cursor.

### Grouped & Numbered

Synonyms and Antonyms are grouped by each of the word's definitions, giving you more context from which to choose a replacement. Each replacement option is assigned a number that allows for easy selection/filtering. 

### Result Caching

Results are cached, so repeated attempts to look up a word only result in a single API call. Cached Results can be cleared out using the command:

```
{
    "command": "mw-thesaurus.clearCache",
    "title": "Merriam-Webster Thesaurus: Clear Cache"
}
```

### Easy Access

Commands can be access from the contextual menu (right-click), using the Command Palette (ctrl+shift+P or cmd+shift+P), or by setting up key bindings (see below.)

 - Merriam-Webster Thesaurus: Synonyms
 - Merriam-Webster Thesaurus: Antonyms
 - Merriam-Webster Thesaurus: Clear Cache

### Key Binding Commands

You can create key bindings to the commands like so:

```
{
    "key": "ctrl+shift+s",
    "command": "mw-thesaurus.synonyms",
},
{
    "key": "ctrl+shift+a",
    "command": "mw-thesaurus.antonyms",
}
```

And for those VIM users out there, you can set up key binding like so:

```
    "vim.normalModeKeyBindings": [
        { 
            "before": ["leader", "c", "s"],
            "commands": [
                "mw-thesaurus.synonyms"
            ]
        },
        { 
            "before": ["leader", "c", "a"],
            "commands": [
                "mw-thesaurus.antonyms"
            ]
        },
    ],
```
