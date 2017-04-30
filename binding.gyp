{
  'targets': [
    {
      "include_dirs": ["<!(node -e \"require('nan')\")"],
      "cflags": ["-Wall", "-Wextra", "-pedantic"],
      "cflags_cc": ["-std=c++14"],
      'target_name': 'fcopy',
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
      "dependencies": [ "<(module_name)" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
          "destination": "<(module_path)"
        }
      ]
    }
  ]
}
