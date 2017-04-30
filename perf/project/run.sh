set -ue
copier=${1:-filecopiers/fcopy.js}
echo $copier

echo cleaning up alottafiles...
rm -rf ./alottafiles/_node_modules

if [ ! -d './alottafiles/node_modules' ]
then
    echo downloading alot of modules...
    (cd ./alottafiles && yarn)
fi

echo ""
echo "modules ready, starting test"
node $copier
