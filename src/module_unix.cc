#include <nan.h>
#include "./uv_sendfile.cc"

NAN_MODULE_INIT(InitAll) {
    Nan::Export(target, "sendfile", cf_uv_sendfile);
}

NODE_MODULE(FCopy, InitAll)