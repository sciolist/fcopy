{
  'targets': [
    {
      "include_dirs": ["<!(node -e \"require('nan')\")"],
      "cflags": ["-Wall", "-Wextra", "-pedantic"],
      "cflags_cc": [],
      'target_name': '<(modname)',
      'defines': [ 'V8_DEPRECATION_WARNINGS=1' ],
      "conditions": [
        ["OS != 'win'", {
            "sources": [
              "src/module_unix.cc"
            ]
        }],
        ["OS == 'win'", {
          "sources": [
              "src/module_unix.cc"
          ]
        }]
      ]
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "<(modname)" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(modname).node" ],
          "destination": "lib/fcopy_binding/"
        }
      ]
    }
  ]
}
