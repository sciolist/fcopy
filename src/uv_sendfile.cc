#include <iostream>
#include <nan.h>

#define MAXLENGTH 0x7fffffff

struct async_sendfile_t {
    uv_fs_t fsreq;
    uint64_t offset;
    int fdout;
    int fdin;
    Nan::Persistent<v8::Function> callback;
};

int advance(async_sendfile_t *req);
void uv_callback(uv_fs_t *res) {
    Nan::HandleScope scope;
    async_sendfile_t *req = (async_sendfile_t*) res->data;
    int result_err = 0;
    if (res->result < 0) {
        result_err = res->result;
    } else if (res->result == MAXLENGTH) {
        req->offset += MAXLENGTH;
        advance(req);
        return;
    }

    int argc = 0;
    v8::Local<v8::Value> argv[1];
    if (result_err) {
      argc = 1;
      argv[0] = Nan::New(result_err);
    }

    auto callback = Nan::New(req->callback);
    Nan::MakeCallback(Nan::GetCurrentContext()->Global(), callback, argc, argv);
    req->callback.Reset();
}

int advance(async_sendfile_t *req) {
    return uv_fs_sendfile(
        uv_default_loop(),
        &req->fsreq,
        req->fdout,
        req->fdin,
        req->offset,
        MAXLENGTH,
        (uv_fs_cb)uv_callback
    );
}

NAN_METHOD(cf_uv_sendfile) {
    int in = info[0]->Int32Value();
    int out = info[1]->Int32Value();
    v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(info[2]);
    async_sendfile_t *req = new async_sendfile_t;
    req->fsreq.data = req;
    req->fdout = out;
    req->fdin = in;
    req->offset = 0;
    req->callback.Reset(callback);
    advance(req);
}
